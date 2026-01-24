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
  BadRequestException,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
} from "./validation/project.validation";
import { AuthGuard } from "../auth/auth.guard";
import {
  Project,
  ProjectStats,
  DeleteResponse,
  ApiResponse,
} from "@detective-quill/shared-types";

@Controller("projects")
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  // todo: access checks are made inside the service methods but try to use them in proper middlewares
  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req,
  ): Promise<ApiResponse<Project>> {
    const data = await this.projectsService.createProject(
      createProjectDto,
      req.user.id,
    );
    return { success: true, data };
  }

  @Get()
  async findAll(
    @Request() req,
    @Query("includeInactive", new DefaultValuePipe(false), ParseBoolPipe)
    includeInactive: boolean,
  ): Promise<ApiResponse<Project[]>> {
    const data = await this.projectsService.findAllUserProjects(
      req.user.id,
      includeInactive,
    );
    return { success: true, data };
  }

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @Request() req,
  ): Promise<ApiResponse<Project>> {
    const data = await this.projectsService.findProjectById(id, req.user.id);
    return { success: true, data };
  }

  @Get(":id/stats")
  async getStats(
    @Param("id") id: string,
    @Request() req,
  ): Promise<ApiResponse<ProjectStats>> {
    const data = await this.projectsService.getProjectStats(id, req.user.id);
    return { success: true, data };
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req,
  ): Promise<ApiResponse<Project>> {
    const data = await this.projectsService.updateProjectInfo(
      id,
      updateProjectDto,
      req.user.id,
    );
    return { success: true, data };
  }

  @Patch(":id/status")
  async changeStatus(
    @Param("id") id: string,
    @Body("status") status: "active" | "completed" | "archived",
    @Request() req,
  ): Promise<ApiResponse<Project>> {
    if (!["active", "completed", "archived"].includes(status)) {
      throw new BadRequestException("Invalid status value");
    }
    await this.projectsService.changeProjectStatus(id, status, req.user.id);
    return { success: true, message: "Project status updated successfully" };
  }

  @Delete(":id")
  async remove(
    @Param("id") id: string,
    @Request() req,
  ): Promise<ApiResponse<DeleteResponse>> {
    const data = await this.projectsService.deleteProject(id, req.user.id);
    return { success: true, data, message: "Project deleted successfully" };
  }

  @Post(":id/restore")
  async restore(
    @Param("id") id: string,
    @Request() req,
  ): Promise<ApiResponse<Project>> {
    const data = await this.projectsService.restoreProject(id, req.user.id);
    return { success: true, data };
  }
}
