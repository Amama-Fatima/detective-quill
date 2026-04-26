import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { WorkerCommitsService } from "src/commits/worker-commits.service";
import {
  type CreateCommitJobData,
  type RevertCommitJobData,
} from "src/queue/dto/queue.dto";

@Controller()
export class CommitsConsumer {
  private readonly logger = new Logger(CommitsConsumer.name);

  constructor(private readonly workerCommitsService: WorkerCommitsService) {}

  @EventPattern("commit_create_job")
  async handleCreateCommit(@Payload() payload: CreateCommitJobData) {
    const { createCommitDto, projectId, userId } = payload;
    try {
      await this.workerCommitsService.createCommit(
        createCommitDto,
        projectId,
        userId,
      );
      this.logger.log(
        `Processed commit_create_job for project ${projectId}, branch ${createCommitDto.branch_id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed commit_create_job for project ${projectId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @EventPattern("commit_revert_job")
  async handleRevertCommit(@Payload() payload: RevertCommitJobData) {
    const { commitId, projectId } = payload;
    try {
      await this.workerCommitsService.revertToCommit(commitId, projectId);
      this.logger.log(
        `Processed commit_revert_job for project ${projectId}, commit ${commitId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed commit_revert_job for project ${projectId}, commit ${commitId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
