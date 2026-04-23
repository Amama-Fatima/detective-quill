import { AuthGuard } from "../auth/auth.guard";
import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { CreateCommitDto } from "./dto/commits.dto";
import { ApiResponse } from "@detective-quill/shared-types";
import { QueueService } from "src/queue/queue.service";

@Controller(":projectId/commits")
@UseGuards(AuthGuard)
export class CommitsController {
  constructor(private readonly queueService: QueueService) {}

  @Post()
  async createCommit(
    @Param("projectId") projectId: string,
    @Body() createCommitDto: CreateCommitDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;

    await this.queueService.sendCreateCommitJob({
      projectId,
      userId,
      createCommitDto,
    });
    console.log(`Enqueued commit creation job for project`);

    return {
      success: true,
      message: "Commit job queued successfully",
    };
  }

  @Post(":commitId/revert")
  async revertToCommit(
    @Param("projectId") projectId: string,
    @Param("commitId") commitId: string,
  ): Promise<
    ApiResponse<{
      branchId: string;
      headCommitId: string;
      deletedCommitsCount: number;
      deletedSnapshotsCount: number;
    }>
  > {
    await this.queueService.sendRevertCommitJob({
      projectId,
      commitId,
    });

    return {
      success: true,
      message: "Revert commit job queued successfully",
    };
  }
}
