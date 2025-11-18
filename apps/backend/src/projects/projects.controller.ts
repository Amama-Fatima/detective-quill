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
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
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

  @Post()
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @Request() req
  ): Promise<ApiResponse<Project>> {
    try {
      const data = await this.projectsService.createProject(
        createProjectDto,
        req.user.id
      );
      return { success: true, data };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }

  @Get()
  async findAll(
    @Request() req,
    @Query("includeInactive", new DefaultValuePipe(false), ParseBoolPipe)
    includeInactive: boolean
  ): Promise<ApiResponse<Project[]>> {
    try {
      const data = await this.projectsService.findAllUserProjects(
        req.user.id,
        includeInactive
      );
      return { success: true, data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }

  // @Get("deleted")
  // async findDeleted(@Request() req): Promise<ApiResponse<Project[]>> {
  //   try {
  //     const data = await this.projectsService.getDeletedProjects(req.user.id);
  //     return { success: true, data };
  //   } catch (error) {
  //     return { success: false, error: error.message };
  //   }
  // }

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @Request() req
  ): Promise<ApiResponse<Project>> {
    try {
      const data = await this.projectsService.findProjectById(id, req.user.id);
      return { success: true, data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }

  @Get(":id/stats")
  async getStats(
    @Param("id") id: string,
    @Request() req
  ): Promise<ApiResponse<ProjectStats>> {
    try {
      const data = await this.projectsService.getProjectStats(id, req.user.id);
      return { success: true, data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req
  ): Promise<ApiResponse<Project>> {
    try {
      const data = await this.projectsService.updateProjectInfo(
        id,
        updateProjectDto,
        req.user.id
      );
      return { success: true, data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }

  @Delete(":id")
  async remove(
    @Param("id") id: string,
    @Request() req
  ): Promise<ApiResponse<DeleteResponse>> {
    try {
      const data = await this.projectsService.deleteProject(id, req.user.id);
      return { success: true, data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }

  @Post(":id/restore")
  async restore(
    @Param("id") id: string,
    @Request() req
  ): Promise<ApiResponse<Project>> {
    try {
      const data = await this.projectsService.restoreProject(id, req.user.id);
      return { success: true, data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }
}
