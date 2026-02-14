import { Controller } from "@nestjs/common";
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from "@nestjs/microservices";
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

  // Listen to ALL messages from the queue using wildcard
  @MessagePattern("*")
  async handleSceneAnalysisResult(
    @Payload() data: any,
    @Ctx() context: RmqContext,
  ) {
    console.log("=== RAW MESSAGE RECEIVED ===");
    console.log("Type:", typeof data);
    console.log("Data:", JSON.stringify(data, null, 2));
    console.log("===========================");

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const content = originalMsg.content.toString();

    try {
      // Parse the raw content since Modal sends plain JSON
      const parsed = JSON.parse(content);
      const { job_id, status, result, error } = parsed;

      console.log(`Received result for job ${job_id}: ${status}`);

      if (status === "completed" && result) {
        await this.nlpAnalysisService.saveAnalysisResult(job_id, result);

        console.log(`✓ Saved knowledge graph for job ${job_id}`);
        console.log(`  - Entities: ${result.metadata.num_entities}`);
        console.log(`  - Relationships: ${result.metadata.num_relationships}`);
      } else {
        console.error(`✗ Job ${job_id} failed: ${error}`);
        await this.nlpAnalysisService.markJobAsFailed(
          job_id,
          error || "Unknown error",
        );
      }

      channel.ack(originalMsg);
    } catch (err) {
      console.error(`Error processing message:`, err);
      channel.nack(originalMsg, false, false);
    }
  }
}
