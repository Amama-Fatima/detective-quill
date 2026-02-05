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
} from "@nestjs/common";
import { FsNodesService } from "./fs-nodes.service";
import {
  CreateFsNodeDto,
  UpdateFileContentDto,
  UpdateNodeMetadataDto,
} from "./validation/fs-nodes.validation";
import { AuthGuard } from "../auth/auth.guard";
import {
  FsNode,
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
    @Request() req,
  ): Promise<ApiResponse<FsNode>> {
    const data = await this.fsNodesService.createNode(
      createNodeDto,
      req.user.id,
    );
    return { success: true, data };
  }

  @Get("project/:projectId/workspace")
  async getEditorWorkspaceData(
    @Param("projectId") projectId: string,
    @Request() req,
  ): Promise<ApiResponse<any>> {
    const nodeId = req.query.nodeId as string | undefined;
    const data = await this.fsNodesService.getEditorWorkspaceData(
      projectId,
      req.user.id,
      nodeId,
    );
    return { success: true, data };
  }

  // todo: forbidden is not thrown in the service any where, add it there jab time milay
  @Get("project/:projectId/tree")
  async getProjectTree(
    @Param("projectId") projectId: string,
    @Request() req,
  ): Promise<ApiResponse<FsNodeTreeResponse[]>> {
    const data = await this.fsNodesService.getProjectTree(
      projectId,
      req.user.id,
    );
    return { success: true, data };
  }

  @Get("project/:projectId/stats")
  async getProjectStats(
    @Param("projectId") projectId: string,
    @Request() req,
  ): Promise<ApiResponse<any>> {
    const data = await this.fsNodesService.getProjectStats(
      projectId,
      req.user.id,
    );
    return { success: true, data };
  }

  @Get(":id/children")
  async getNodeChildren(
    @Param("id") id: string,
    @Request() req,
  ): Promise<ApiResponse<FsNode[]>> {
    const data = await this.fsNodesService.getNodeChildren(id, req.user.id);
    return { success: true, data };
  }

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @Request() req,
  ): Promise<ApiResponse<FsNode>> {
    const data = await this.fsNodesService.getNode(id, req.user.id);
    return { success: true, data };
  }

  @Patch(":id/content")
  async updateContent(
    @Param("id") id: string,
    @Body() updateContentDto: UpdateFileContentDto,
    @Request() req,
  ): Promise<ApiResponse<FsNode>> {
    const data = await this.fsNodesService.updateFileContent(
      id,
      updateContentDto,
      req.user.id,
    );
    return { success: true, data };
  }

  @Patch(":id/metadata")
  async updateMetadata(
    @Param("id") id: string,
    @Body() updateMetadataDto: UpdateNodeMetadataDto,
    @Request() req,
  ): Promise<ApiResponse<FsNode>> {
    const data = await this.fsNodesService.updateNodeMetadata(
      id,
      updateMetadataDto,
      req.user.id,
    );
    return { success: true, data };
  }

  @Delete(":id")
  async remove(
    @Param("id") id: string,
    @Request() req,
  ): Promise<ApiResponse<DeleteResponse>> {
    const data = await this.fsNodesService.deleteNode(id, req.user.id);
    return { success: true, data };
  }

  @Patch(":id/move")
  async move(
    @Param("id") id: string,
    @Body() moveData: { parent_id: string | null; sort_order: number },
    @Request() req,
  ): Promise<ApiResponse<FsNode>> {
    const data = await this.fsNodesService.moveNode(
      id,
      moveData.parent_id,
      moveData.sort_order,
      req.user.id,
    );
    return { success: true, data };
  }
}
