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
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { FsNodesService } from "./fs-nodes.service";
import {
  CreateFsNodeDto,
  UpdateFsNodeDto,
} from "./validation/fs-nodes.validation";
import { AuthGuard } from "../auth/auth.guard";
import {
  FsNodeResponse,
  FsNodeTreeResponse,
  DeleteResponse,
  ApiResponse,
} from "@detective-quill/shared-types";

@Controller("fs-nodes")
@UseGuards(AuthGuard)
export class FsNodesController {
  constructor(private readonly fsNodesService: FsNodesService) {}

  @Post()
  async create(
    @Body() createNodeDto: CreateFsNodeDto,
    @Request() req
  ): Promise<ApiResponse<FsNodeResponse>> {
    try {
      const data = await this.fsNodesService.createNode(
        createNodeDto,
        req.user.id
      );
      return { success: true, data };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }

  // todo: forbidden is not thrown in the service any where, add it there jab time milay
  @Get("project/:projectId/tree")
  async getProjectTree(
    @Param("projectId") projectId: string,
    @Request() req
  ): Promise<ApiResponse<FsNodeTreeResponse[]>> {
    try {
      const data = await this.fsNodesService.getProjectTree(
        projectId,
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

  @Get("project/:projectId/stats")
  async getProjectStats(
    @Param("projectId") projectId: string,
    @Request() req
  ): Promise<ApiResponse<any>> {
    try {
      const data = await this.fsNodesService.getProjectStats(
        projectId,
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

  @Get(":id/children")
  async getNodeChildren(
    @Param("id") id: string,
    @Request() req
  ): Promise<ApiResponse<FsNodeResponse[]>> {
    try {
      const data = await this.fsNodesService.getNodeChildren(id, req.user.id);
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

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @Request() req
  ): Promise<ApiResponse<FsNodeResponse>> {
    try {
      const data = await this.fsNodesService.getNode(id, req.user.id);
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
    @Body() updateNodeDto: UpdateFsNodeDto,
    @Request() req
  ): Promise<ApiResponse<FsNodeResponse>> {
    try {
      const data = await this.fsNodesService.updateNode(
        id,
        updateNodeDto,
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
      const data = await this.fsNodesService.deleteNode(id, req.user.id);
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

  @Patch(":id/move")
  async move(
    @Param("id") id: string,
    @Body() moveData: { parent_id: string | null; sort_order: number },
    @Request() req
  ): Promise<ApiResponse<FsNodeResponse>> {
    try {
      const data = await this.fsNodesService.moveNode(
        id,
        moveData.parent_id,
        moveData.sort_order,
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
}
