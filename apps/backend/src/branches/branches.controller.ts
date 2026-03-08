import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
  Param,
  Request,
} from "@nestjs/common";
import { BranchesService } from "./branches.service";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateBranchDto, UpdateBranchDto } from "./dto/branches.dto";
import { ProjectsService } from "src/projects/projects.service";
import { ApiResponse, Branch } from "@detective-quill/shared-types";

@Controller(":projectId/branches")
@UseGuards(AuthGuard)
export class BranchesController {
  constructor(
    private readonly branchesService: BranchesService,
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  async createBranch(
    @Param("projectId") projectId: string,
    @Body() createBranchDto: CreateBranchDto,
    @Request() req: any,
  ): Promise<ApiResponse<Branch>> {
    await this.projectsService.verifyProjectOwnership(projectId, req.user.id);

    const data = await this.branchesService.createBranch(
      createBranchDto,
      projectId,
    );
    return {
      success: true,
      data,
      message: "Branch created successfully",
    };
  }

  @Put(":branchId")
  async updateBranch(
    @Param("projectId") projectId: string,

    @Param("branchId") branchId: string,
    @Body() updateBranchDto: UpdateBranchDto,
    @Request() req: any,
  ): Promise<ApiResponse<Branch>> {
    console.log("Updating branch with ID:", branchId, "Data:", updateBranchDto);
    console.log("User ID from request:", req.user.id);
    await this.projectsService.verifyProjectOwnership(projectId, req.user.id);

    const data = await this.branchesService.updateBranch(
      branchId,
      updateBranchDto,
    );

    return {
      success: true,
      data,
      message: "Branch updated successfully",
    };
  }

  @Delete(":branchId")
  async deleteBranch(
    @Param("projectId") projectId: string,
    @Param("branchId") branchId: string,
    @Request() req: any,
  ): Promise<ApiResponse<null>> {
    await this.projectsService.verifyProjectOwnership(projectId, req.user.id);
    await this.branchesService.deleteBranch(branchId);
    return {
      success: true,
      message: "Branch deleted successfully",
    };
  }

  @Post(":branchId/switch")
  async switchActiveBranch(
    @Param("projectId") projectId: string,
    @Param("branchId") branchId: string,
    @Request() req: any,
  ): Promise<
    ApiResponse<{
      branch: Branch;
      headCommitId: string | null;
    }>
  > {
    const userId = req.user.id;
    const data = await this.branchesService.switchActiveBranch(
      projectId,
      branchId,
      userId,
    );

    return {
      success: true,
      data,
      message: "Active branch switched successfully",
    };
  }
}
