import { Injectable, Inject, OnModuleDestroy } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import * as amqp from "amqplib";
import { once } from "events";
import { EmailSendingJobData } from "@detective-quill/shared-types";
import {
  type SceneAnalysisJobData,
  type CreateCommitJobData,
  type RevertCommitJobData,
} from "./dto/queue.dto";

const SCENE_ANALYSIS_QUEUE = "scene_analysis_queue";

/** amqplib connection shape at runtime (@types/amqplib is inconsistent) so we define only the necessary methods */
interface AmqpConnection {
  createChannel(): Promise<amqp.Channel>;
  close(): Promise<void>;
  on(event: string, listener: (...args: any[]) => void): void;
}

// todo: where will errors that are thrown here be catched?
@Injectable()
export class QueueService implements OnModuleDestroy {
  private sceneAnalysisConnection: AmqpConnection | null = null;
  private sceneAnalysisChannel: amqp.Channel | null = null;
  private sceneChannelInitPromise: Promise<amqp.Channel> | null = null;

  constructor(
    @Inject("RABBITMQ_COMMITS_SERVICE")
    private readonly commitRabbitClient: ClientProxy,
    @Inject("RABBITMQ_EMAIL_SERVICE")
    private readonly emailRabbitClient: ClientProxy,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.closeSceneAnalysisResources();
  }

  private resetSceneAnalysisResources(): void {
    this.sceneAnalysisChannel = null;
    this.sceneAnalysisConnection = null;
    this.sceneChannelInitPromise = null;
  }

  private async closeSceneAnalysisResources(): Promise<void> {
    const channel = this.sceneAnalysisChannel;
    const connection = this.sceneAnalysisConnection;
    this.resetSceneAnalysisResources();

    if (channel) {
      try {
        await channel.close();
      } catch {
        // Ignore close errors during shutdown/reset.
      }
    }

    if (connection) {
      try {
        await connection.close();
      } catch {
        // Ignore close errors during shutdown/reset.
      }
    }
  }

  private async ensureSceneAnalysisChannel(): Promise<amqp.Channel> {
    if (this.sceneAnalysisChannel) {
      return this.sceneAnalysisChannel;
    }

    if (!this.sceneChannelInitPromise) {
      const url =
        process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";
      this.sceneChannelInitPromise = (async () => {
        const connection = (await amqp.connect(
          url,
        )) as unknown as AmqpConnection;
        connection.on("error", (err) => {
          console.error("Scene analysis RabbitMQ connection error:", err);
        });
        connection.on("close", () => {
          this.resetSceneAnalysisResources();
        });

        const channel = await connection.createChannel();
        await channel.assertQueue(SCENE_ANALYSIS_QUEUE, { durable: true });

        this.sceneAnalysisConnection = connection;
        this.sceneAnalysisChannel = channel;

        return channel;
      })();
    }

    try {
      return await this.sceneChannelInitPromise;
    } catch (error) {
      this.resetSceneAnalysisResources();
      throw error;
    } finally {
      if (this.sceneAnalysisChannel) {
        this.sceneChannelInitPromise = null;
      }
    }
  }

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
      commit_id: jobData.commit_id,
      project_id: jobData.project_id,
      timestamp: new Date().toISOString(),
    };

    const logPayload = {
      job_id: payload.job_id,
      user_id: payload.user_id,
      scene_text_preview:
        payload.scene_text?.slice(0, 60) +
        (payload.scene_text && payload.scene_text.length > 60 ? "…" : ""),
      scene_text_length: payload.scene_text?.length ?? 0,
      timestamp: payload.timestamp,
    };

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const channel = await this.ensureSceneAnalysisChannel();
        const sent = channel.sendToQueue(
          SCENE_ANALYSIS_QUEUE,
          Buffer.from(JSON.stringify(payload)),
          { persistent: true },
        );

        if (!sent) {
          await once(channel as unknown as NodeJS.EventEmitter, "drain");
        }

        console.log(
          `Scene analysis job published to ${SCENE_ANALYSIS_QUEUE}: ${payload.job_id}`,
          JSON.stringify(logPayload, null, 2),
        );
        return;
      } catch (error) {
        await this.closeSceneAnalysisResources();
        if (attempt === 2) {
          throw error;
        }
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
