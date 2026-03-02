// src/queue/queue.service.ts
import { Injectable, Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { EmailSendingJobData } from "@detective-quill/shared-types";
import { firstValueFrom } from "rxjs";

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
// }

export interface SceneAnalysisJobData {
  job_id: string;
  scene_text: string;
  user_id: string;
  project_id?: string;
}

export interface CreateCommitJobData {
  projectId: string;
  userId: string;
  createCommitDto: {
    message: string;
    branch_id: string;
  };
}

export interface RevertCommitJobData {
  projectId: string;
  commitId: string;
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
  ) {}

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

  sendSceneAnalysisJob(jobData: SceneAnalysisJobData) {
    try {
      this.rabbitClient.emit("scene_analysis_job", {
        ...jobData,
        timestamp: new Date().toISOString(),
      });

      console.log(`Scene analysis job queued: ${jobData.job_id}`);
    } catch (error) {
      console.error("Failed to queue scene analysis job:", error);
      throw error;
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
