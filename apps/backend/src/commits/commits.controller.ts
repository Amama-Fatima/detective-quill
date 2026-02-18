import { AuthGuard } from "../auth/auth.guard";
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { CommitsService } from "./commits.service";
import { CreateCommitDto } from "./dto/commits.dto";

@Controller(":projectId/commits")
@UseGuards(AuthGuard)
export class CommitsController {
  constructor(private readonly commitsService: CommitsService) {}

  @Post()
  async createCommit(
    @Param("projectId") projectId: string,
    @Body() createCommitDto: CreateCommitDto,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    console.log("projectId:", projectId);
    return await this.commitsService.createCommit(
      createCommitDto,
      projectId,
      userId,
    );
  }

  @Get()
  async getCommitsByProject(@Param("projectId") projectId: string) {
    return await this.commitsService.getCommitsByProject(projectId);
  }

  @Get("branch/:branchId")
  async getCommitsByBranch(
    @Param("branchId") branchId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page || "1", 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit || "10", 10) || 10));
    return await this.commitsService.getCommitsByBranch(
      branchId,
      pageNum,
      limitNum,
    );
  }

  @Get(":commitId")
  async getCommitById(@Param("commitId") commitId: string) {
    return await this.commitsService.getCommitById(commitId);
  }

  // @Post(":commitId/restore")
  // async restoreFromCommit(
  //   @Param("projectId") projectId: string,
  //   @Param("commitId") commitId: string,
  // ) {
  //   return await this.commitsService.restoreFromCommit(commitId, projectId);
  // }
}