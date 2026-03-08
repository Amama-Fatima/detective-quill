import { Injectable, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import * as amqp from "amqplib";
import { EmailSendingJobData } from "@detective-quill/shared-types";
import {
  type SceneAnalysisJobData,
  type CreateCommitJobData,
  type RevertCommitJobData,
} from "./dto/queue.dto";

// export interface EmbeddingJobData {
//   fs_node_id: string;
//   content: string;
//   project_id: string;
//   user_id: string;
//   scene_name: string;
//   chapter_name?: string;
//   chapter_sort_order?: number;
//   scene_sort_order?: number;
//   global_sequence?: number;
//   timeline_path?: string;
//   /** If set, Python worker uses this as Neo4j scene_id; otherwise job_id is used. */
// scene_id?: string;
// }

const SCENE_ANALYSIS_QUEUE = "scene_analysis_queue";

/** amqplib connection shape at runtime (@types/amqplib is inconsistent) */
interface AmqpConnection {
  createChannel(): Promise<amqp.Channel>;
  close(): Promise<void>;
}

// todo: where will errors that are thrown here be catched?
@Injectable()
export class QueueService {
  constructor(
    @Inject("RABBITMQ_NLP_SERVICE") private readonly rabbitClient: ClientProxy,
    @Inject("RABBITMQ_COMMITS_SERVICE")
    private readonly commitRabbitClient: ClientProxy,
    @Inject("RABBITMQ_EMAIL_SERVICE")
    private readonly emailRabbitClient: ClientProxy,
    @Inject("RABBITMQ_BRANCHES_SERVICE")
    private readonly branchRabbitClient: ClientProxy,
  ) {
    const url = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
    const host = url.replace(/^amqps?:\/\/([^:]+:[^@]+@)?/, "").split("/")[0];
    console.log(`[QueueService] RabbitMQ broker: ${host}`);
  }

  // sendEmbeddingJob(jobData: EmbeddingJobData) {
  //   try {
  //     // Send the job to RabbitMQ
  //     this.rabbitClient.emit("embedding_job", {
  //       ...jobData,
  //       timestamp: new Date().toISOString(),
  //       max_chunk_size: 800, // words per chunk
  //     });

  //     console.log(`Embedding job queued for fs_node_id: ${jobData.fs_node_id}`);
  //   } catch (error) {
  //     console.error("Failed to queue embedding job:", error);
  //     throw error;
  //   }
  // }

  sendInviteEmailsJob(jobData: EmailSendingJobData) {
    try {
      this.emailRabbitClient.emit("invite_email_job", {
        ...jobData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to queue invite emails job:", error);
      throw error;
    }
  }

  /**
   * Publish scene analysis job directly to RabbitMQ (plain JSON) so Modal/pika
   * consumers receive it. NestJS ClientProxy was not reliably putting messages
   * in the queue visible to CloudAMQP / Modal.
   */
  async sendSceneAnalysisJob(jobData: SceneAnalysisJobData): Promise<void> {
    const payload = {
      job_id: jobData.job_id,
      scene_text: jobData.scene_text,
      user_id: jobData.user_id,
      scene_id: jobData.scene_id ?? jobData.job_id,
      timestamp: new Date().toISOString(),
    };

    const url = process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
    let conn: AmqpConnection | null = null;

    try {
      conn = (await amqp.connect(url)) as unknown as AmqpConnection;
      const ch = await conn.createChannel();
      await ch.assertQueue(SCENE_ANALYSIS_QUEUE, { durable: true });
      const sent = ch.sendToQueue(
        SCENE_ANALYSIS_QUEUE,
        Buffer.from(JSON.stringify(payload)),
        { persistent: true },
      );
      await ch.close();
      if (!sent) {
        throw new Error("Channel buffer full, message not sent");
      }

      const logPayload = {
        job_id: payload.job_id,
        scene_id: payload.scene_id,
        user_id: payload.user_id,
        scene_text_preview:
          payload.scene_text?.slice(0, 60) +
          (payload.scene_text && payload.scene_text.length > 60 ? "…" : ""),
        scene_text_length: payload.scene_text?.length ?? 0,
        timestamp: payload.timestamp,
      };
      console.log(
        `Scene analysis job published to ${SCENE_ANALYSIS_QUEUE}: ${payload.job_id}`,
        JSON.stringify(logPayload, null, 2),
      );
    } finally {
      if (conn) {
        await conn.close();
      }
    }
  }

  sendCreateCommitJob(jobData: CreateCommitJobData) {
    try {
      this.commitRabbitClient.emit("commit_create_job", {
        ...jobData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to queue create commit job:", error);
      throw error;
    }
  }

  sendRevertCommitJob(jobData: RevertCommitJobData) {
    try {
      this.commitRabbitClient.emit("commit_revert_job", {
        ...jobData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to queue revert commit job:", error);
      throw error;
    }
  }
}
