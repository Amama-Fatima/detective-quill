import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  UseGuards,
  Param,
} from "@nestjs/common";
import { BranchesService } from "./branches.service";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateBranchDto, UpdateBranchDto } from "./dto/branches.dto";

@Controller(":projectId/branches")
@UseGuards(AuthGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Post()
  async createBranch(
    @Param("projectId") projectId: string,
    @Body() createBranchDto: CreateBranchDto,
  ) {
    return await this.branchesService.createBranch(createBranchDto, projectId);
  }

  @Get()
  async getBranchesByProject(@Param("projectId") projectId: string) {
    return await this.branchesService.getBranchesByProject(projectId);
  }

  @Get(":branchId")
  async getBranchById(@Param("branchId") branchId: string) {
    return await this.branchesService.getBranchById(branchId);
  }

  @Put(":branchId")
  async updateBranch(
    @Param("branchId") branchId: string,
    @Body() updateBranchDto: UpdateBranchDto,
  ) {
    return await this.branchesService.updateBranch(branchId, updateBranchDto);
  }

  @Delete(":branchId")
  async deleteBranch(@Param("branchId") branchId: string) {
    return await this.branchesService.deleteBranch(branchId);
  }
}
