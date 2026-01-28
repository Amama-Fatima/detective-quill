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

@Injectable()
export class NlpAnalysisService {
  constructor(private supabaseService: SupabaseService) {}

  async submitJob(
    dto: SubmitAnalysisDto,
    userId: string,
  ): Promise<AnalysisResponseDto> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from("nlp_analysis_jobs")
      .insert({
        user_id: userId,
        scenet_text: dto.scene_text,
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

    // todo: publish to rabbit mq
    //    await this.publishToRabbitMQ({
    //      job_id: jobId,
    //      scene_text: dto.sceneText,
    //      user_id: userId,
    //    });

    return {
      job_id,
      status: "QUEUED",
      message: "Analysis job submitted successfully",
      polling_url: `/api/nlp-analysis/status/${job_id}`,
    };
  }

  async getJobStatus(jobId, userId: string): Promise<JobStatusDto> {
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

    // 2. TODO: Fetch from Neo4j (dummy placeholder)
    const graph = await this.fetchFromNeo4j(jobId);

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

  private async fetchFromNeo4j(jobId: string): Promise<{
    entities: any[];
    relationships: any[];
  }> {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("Fetching from Neo4j for job:", jobId);

    return {
      entities: [
        {
          id: "entity-1",
          name: "Detective Marcus Chen",
          type: "PERSON",
          role: "detective",
          description: "Lead investigator on the case",
          attributes: { occupation: "Detective" },
        },
        {
          id: "entity-2",
          name: "Sarah Williams",
          type: "PERSON",
          role: "victim",
          description: "Victim found at crime scene",
          attributes: { status: "deceased" },
        },
      ],
      relationships: [
        {
          source: "entity-1",
          target: "entity-2",
          type: "INVESTIGATES",
          evidence: "Detective Chen examined the victim",
          confidence: 0.95,
        },
      ],
    };
  }
}
