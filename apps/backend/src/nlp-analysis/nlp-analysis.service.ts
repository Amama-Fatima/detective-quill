import { SupabaseService } from "src/supabase/supabase.service";
import {
  AnalysisResponseDto,
  AnalysisResultDto,
  JobStatusDto,
  SubmitAnalysisDto,
} from "./dto/nlp-analysis.dto";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { QueueService } from "../queue/queue.service";

export interface Entity {
  name: string;
  type: string;
  mentions: string[];
  attributes: Record<string, any>;
}

export interface Relationship {
  source: string;
  target: string;
  relation_type: string;
  description: string;
  confidence: number;
}

export interface PipelineMetadata {
  num_entities: number;
  num_relationships: number;
  num_raw_entities: number;
}

export interface PipelineResult {
  entities: Entity[];
  relationships: Relationship[];
  metadata: PipelineMetadata;
}

@Injectable()
export class NlpAnalysisService {
  constructor(
    private supabaseService: SupabaseService,
    private queueService: QueueService,
  ) {}

  async submitJob(
    dto: SubmitAnalysisDto,
    userId: string,
  ): Promise<AnalysisResponseDto> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from("nlp_analysis_jobs")
      .insert({
        user_id: userId,
        scene_text: dto.scene_text,
        status: "QUEUED",
        progress: 0,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to create analysis job: ${error.message}`,
      );
    }

    const job_id = data.job_id;

    // Publish to RabbitMQ (Python worker will consume this)
    this.queueService.sendSceneAnalysisJob({
      job_id,
      scene_text: dto.scene_text,
      user_id: userId,
    });

    console.log(`Scene analysis job queued: ${job_id}`);

    return {
      job_id,
      status: "QUEUED",
      message: "Analysis job submitted successfully",
      polling_url: `/api/nlp-analysis/status/${job_id}`,
    };
  }

  async getJobStatus(jobId: string, userId: string): Promise<JobStatusDto> {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("nlp_analysis_jobs")
      .select("*")
      .eq("job_id", jobId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    return {
      job_id: data.job_id,
      status: data.status,
      progress: data.progress,
      stage: data.current_stage,
      created_at: data.created_at,
      completed_at: data.completed_at,
      error_message: data.error_message,
    };
  }

  async getUserHistory(userId: string): Promise<JobStatusDto[]> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from("nlp_analysis_jobs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new BadRequestException(
        `Failed to fetch user history: ${error.message}`,
      );
    }

    return (data || []).map((job) => ({
      job_id: job.job_id,
      status: job.status,
      progress: job.progress,
      stage: job.current_stage,
      created_at: job.created_at,
      completed_at: job.completed_at,
      error_message: job.error_message,
    }));
  }

  async getResults(jobId: string, userId: string): Promise<AnalysisResultDto> {
    const supabase = this.supabaseService.client;

    // 1. Get job from Supabase
    const { data: job, error } = await supabase
      .from("nlp_analysis_jobs")
      .select("*")
      .eq("job_id", jobId)
      .eq("user_id", userId)
      .single();

    if (error || !job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    if (job.status !== "COMPLETED") {
      throw new BadRequestException(
        `Job is not completed yet. Current status: ${job.status}`,
      );
    }

    // 2. Fetch entities and relationships from Supabase
    const graph = await this.fetchKnowledgeGraph(jobId);

    return {
      job_id: jobId,
      entities: graph.entities,
      relationships: graph.relationships,
      metadata: {
        processing_time: job.processing_time || "N/A",
        entity_count: job.entity_count || 0,
        relationship_count: job.relationship_count || 0,
      },
    };
  }

  /**
   * Called by the worker consumer when Python completes processing
   *
   * Saves the analysis result to Supabase
   */
  async saveAnalysisResult(
    jobId: string,
    result: PipelineResult,
  ): Promise<void> {
    const supabase = this.supabaseService.client;

    // 1. Update job status to COMPLETED
    const { error: jobError } = await supabase
      .from("nlp_analysis_jobs")
      .update({
        status: "COMPLETED",
        progress: 100,
        current_stage: "finished",
        completed_at: new Date().toISOString(),
        entity_count: result.metadata.num_entities,
        relationship_count: result.metadata.num_relationships,
      })
      .eq("job_id", jobId);

    if (jobError) {
      console.error(`Failed to update job status for ${jobId}:`, jobError);
      throw new Error(`Failed to update job: ${jobError.message}`);
    }

    // 2. Save entities
    const entities = result.entities.map((entity) => ({
      job_id: jobId,
      name: entity.name,
      type: entity.type,
      mentions: entity.mentions,
      attributes: entity.attributes,
    }));

    if (entities.length > 0) {
      const { error: entitiesError } = await supabase
        .from("nlp_entities")
        .insert(entities);

      if (entitiesError) {
        console.error(`Failed to save entities for ${jobId}:`, entitiesError);
        throw new Error(`Failed to save entities: ${entitiesError.message}`);
      }
    }

    // 3. Save relationships
    const relationships = result.relationships.map((rel) => ({
      job_id: jobId,
      source: rel.source,
      target: rel.target,
      relation_type: rel.relation_type,
      description: rel.description,
      confidence: rel.confidence,
    }));

    if (relationships.length > 0) {
      const { error: relError } = await supabase
        .from("nlp_relationships")
        .insert(relationships);

      if (relError) {
        console.error(`Failed to save relationships for ${jobId}:`, relError);
        throw new Error(`Failed to save relationships: ${relError.message}`);
      }
    }

    console.log(`✓ Saved analysis result for job ${jobId}`);
    console.log(`  - Entities: ${result.metadata.num_entities}`);
    console.log(`  - Relationships: ${result.metadata.num_relationships}`);
  }

  /**
   * Called by the worker consumer when Python reports an error
   *
   * Marks the job as failed in Supabase
   */
  async markJobAsFailed(jobId: string, error: string): Promise<void> {
    const supabase = this.supabaseService.client;

    const { error: updateError } = await supabase
      .from("nlp_analysis_jobs")
      .update({
        status: "FAILED",
        progress: 0,
        current_stage: "failed",
        completed_at: new Date().toISOString(),
        error_message: error,
      })
      .eq("job_id", jobId);

    if (updateError) {
      console.error(`Failed to mark job ${jobId} as failed:`, updateError);
    }

    console.error(`✗ Marked job ${jobId} as failed: ${error}`);
  }

  /**
   * Fetch knowledge graph from Supabase
   *
   * Used by getResults() to return the saved entities and relationships
   */
  private async fetchKnowledgeGraph(jobId: string): Promise<{
    entities: any[];
    relationships: any[];
  }> {
    const supabase = this.supabaseService.client;

    // Fetch entities
    const { data: entities, error: entitiesError } = await supabase
      .from("nlp_entities")
      .select("*")
      .eq("job_id", jobId);

    if (entitiesError) {
      console.error(`Failed to fetch entities for ${jobId}:`, entitiesError);
      return { entities: [], relationships: [] };
    }

    // Fetch relationships
    const { data: relationships, error: relError } = await supabase
      .from("nlp_relationships")
      .select("*")
      .eq("job_id", jobId);

    if (relError) {
      console.error(`Failed to fetch relationships for ${jobId}:`, relError);
      return { entities: entities || [], relationships: [] };
    }

    return {
      entities: entities || [],
      relationships: relationships || [],
    };
  }
}
