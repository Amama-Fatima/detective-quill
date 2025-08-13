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
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get("project/:projectId/tree")
  async getProjectTree(
    @Param("projectId") projectId: string,
    @Request() req
  ): Promise<ApiResponse<FsNodeTreeResponse[]>> {
    try {
      const data = await this.fsNodesService.getProjectTree(
        projectId,
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
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
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ✅ NEW: Get node children using DB function
  @Get(":id/children")
  async getNodeChildren(
    @Param("id") id: string,
    @Request() req
  ): Promise<ApiResponse<FsNodeResponse[]>> {
    try {
      const data = await this.fsNodesService.getNodeChildren(
        id,
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @Request() req
  ): Promise<ApiResponse<FsNodeResponse>> {
    try {
      const data = await this.fsNodesService.getNode(
        id,
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
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
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Delete(":id")
  async remove(
    @Param("id") id: string,
    @Request() req,
    @Query("hard", new DefaultValuePipe(false), ParseBoolPipe)
    hardDelete: boolean,
    @Query("cascade", new DefaultValuePipe(false), ParseBoolPipe)
    cascadeDelete: boolean
  ): Promise<ApiResponse<DeleteResponse>> {
    try {
      const data = await this.fsNodesService.deleteNode(
        id,
        req.user.id,
        req.accessToken,
        hardDelete,
        cascadeDelete
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
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
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
