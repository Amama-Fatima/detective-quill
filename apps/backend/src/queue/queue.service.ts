// src/queue/queue.service.ts
import { Injectable, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";

export interface EmbeddingJobData {
  fs_node_id: string;
  content: string;
  project_id: string;
  user_id: string;
  scene_name: string;
  chapter_name?: string;
  chapter_sort_order?: number;
  scene_sort_order?: number;
  global_sequence?: number;
  timeline_path?: string;
}

@Injectable()
export class QueueService {
  constructor(
    @Inject("RABBITMQ_SERVICE") private readonly rabbitClient: ClientProxy
  ) {}

  sendEmbeddingJob(jobData: EmbeddingJobData) {
    try {
      // Send the job to RabbitMQ
      this.rabbitClient.emit("embedding_job", {
        ...jobData,
        timestamp: new Date().toISOString(),
        max_chunk_size: 800, // words per chunk
      });

      console.log(`Embedding job queued for fs_node_id: ${jobData.fs_node_id}`);
    } catch (error) {
      console.error("Failed to queue embedding job:", error);
      throw error;
    }
  }
}
