import { AuthGuard } from "../auth/auth.guard";
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
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
  async getCommitsByBranch(@Param("branchId") branchId: string) {
    return await this.commitsService.getCommitsByBranch(branchId);
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