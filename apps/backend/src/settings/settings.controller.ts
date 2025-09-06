import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseBoolPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { SettingsService } from "./settings.service";
import { AuthGuard } from "../auth/auth.guard";
import type {
  UpdateProjectDto,
  ProjectResponse,
  DeleteResponse,
  ApiResponse,
  ProjectMember,
  AddMemberDto,
} from "@detective-quill/shared-types";

@Controller("projects/:projectId/settings")
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Update project information
  @Patch("info")
  async updateProjectInfo(
    @Param("projectId") projectId: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req
  ): Promise<ApiResponse<ProjectResponse>> {
    try {
      const data = await this.settingsService.updateProjectInfo(
        projectId,
        updateProjectDto,
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get all project members
  @Get("members")
  async getProjectMembers(
    @Param("projectId") projectId: string,
    @Request() req
  ): Promise<ApiResponse<ProjectMember[]>> {
    try {
      const data = await this.settingsService.getProjectMembers(
        projectId,
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Add a new member
  @Post("members")
  async addProjectMember(
    @Param("projectId") projectId: string,
    @Body() addMemberDto: AddMemberDto,
    @Request() req
  ): Promise<ApiResponse<ProjectMember>> {
    try {
      const data = await this.settingsService.addProjectMember(
        projectId,
        addMemberDto,
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Remove a member
  @Delete("members/:memberId")
  async removeProjectMember(
    @Param("projectId") projectId: string,
    @Param("memberId") memberId: string,
    @Request() req
  ): Promise<ApiResponse<DeleteResponse>> {
    try {
      const data = await this.settingsService.removeProjectMember(
        projectId,
        memberId,
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete the entire project
  @Delete("")
  async deleteProject(
    @Param("projectId") projectId: string,
    @Request() req
  ): Promise<ApiResponse<DeleteResponse>> {
    try {
      const data = await this.settingsService.deleteProject(
        projectId,
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
