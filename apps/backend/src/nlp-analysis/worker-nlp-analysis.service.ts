import { Injectable } from "@nestjs/common";
import { AdminSupabaseService } from "../supabase/admin-supabase.service";
import { PipelineResult } from "./nlp-analysis.service";

@Injectable()
export class WorkerNlpAnalysisService {
  constructor(private adminSupabaseService: AdminSupabaseService) {}

  async saveAnalysisResult(
    jobId: string,
    result: PipelineResult,
  ): Promise<void> {
    const supabase = this.adminSupabaseService.client;

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
      throw new Error(`Failed to update job: ${jobError.message}`);
    }

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
        throw new Error(`Failed to save entities: ${entitiesError.message}`);
      }
    }

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
        throw new Error(`Failed to save relationships: ${relError.message}`);
      }
    }

    console.log(`✓ Saved analysis result for job ${jobId}`);
  }

  async markJobAsFailed(jobId: string, error: string): Promise<void> {
    const supabase = this.adminSupabaseService.client;

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
}
