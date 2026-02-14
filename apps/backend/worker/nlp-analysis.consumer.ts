import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { WorkerNlpAnalysisService } from "src/nlp-analysis/worker-nlp-analysis.service";

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

export interface SceneAnalysisResponse {
  job_id: string;
  status: "completed" | "failed";
  result: PipelineResult | null;
  error: string | null;
}

@Controller()
export class NlpAnalysisConsumer {
  constructor(private nlpAnalysisService: WorkerNlpAnalysisService) {}

  /**
   * Handles results from the Python knowledge-graph worker
   *
   * This receives messages from the 'scene_analysis_results_queue'
   */
  @EventPattern("*")
  async handleSceneAnalysisResult(@Payload() data: SceneAnalysisResponse) {
    const { job_id, status, result, error } = data;

    console.log(`Received result for job ${job_id}: ${status}`);

    if (status === "completed" && result) {
      // Success - save the knowledge graph to database
      try {
        await this.nlpAnalysisService.saveAnalysisResult(job_id, result);

        console.log(`✓ Saved knowledge graph for job ${job_id}`);
        console.log(`  - Entities: ${result.metadata.num_entities}`);
        console.log(`  - Relationships: ${result.metadata.num_relationships}`);
      } catch (err) {
        console.error(`Error saving result for job ${job_id}:`, err);
        await this.nlpAnalysisService.markJobAsFailed(
          job_id,
          `Failed to save result: ${err.message}`,
        );
      }
    } else {
      // Failure - mark job as failed
      console.error(`✗ Job ${job_id} failed: ${error}`);
      await this.nlpAnalysisService.markJobAsFailed(
        job_id,
        error || "Unknown error",
      );
    }
  }
}
