import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import {
  type GetFoldersQuery,
  type GetFoldersResponse,
  type CreateFolderDto,
  type CreateFolderResponse,
  type UpdateFolderDto,
  type UpdateFolderResponse,
  type DeleteFolderResponse,
} from "@detective-quill/shared-types";
import { FoldersService } from "./folders.service";

@Controller("folders")
@UseGuards(AuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Get()
  async getFolders(
    @Query() query: GetFoldersQuery,
    @Req() request: any
  ): Promise<GetFoldersResponse> {
    const { projectTitle, includeChildren = true } = query;
    const userId = request.user.id;

    if (!projectTitle) {
      throw new BadRequestException("Project title is required");
    }

    try {
      const folders = await this.foldersService.getFoldersByProject(
        userId,
        projectTitle,
        includeChildren,
        request.accessToken
      );

      return {
        success: true,
        data: folders,
        message: `Found ${folders.length} folders for project "${projectTitle}"`,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || "Failed to fetch folders",
      };
    }
  }

  @Post()
  async createFolder(
    @Body() createFolderDto: CreateFolderDto,
    @Req() request: any
  ): Promise<CreateFolderResponse> {
    const { projectTitle, name, parentId, folderOrder } = createFolderDto;
    const userId = request.user.id;

    if (!projectTitle || !name) {
      throw new BadRequestException(
        "Project title and folder name are required"
      );
    }

    try {
      const folder = await this.foldersService.createFolder(
        userId,
        projectTitle,
        { name, parentId: parentId || null, folderOrder: folderOrder || 0 },
        request.accessToken
      );

      return {
        success: true,
        data: folder,
        message: `Folder "${name}" created successfully`,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error.message || "Failed to create folder",
      };
    }
  }

  @Put(":id")
  async updateFolder(
    @Param("id") folderId: string,
    @Body() updateFolderDto: Omit<UpdateFolderDto, "id">,
    @Req() request: any
  ): Promise<UpdateFolderResponse> {
    const userId = request.user.id;

    if (!folderId) {
      throw new BadRequestException("Folder ID is required");
    }

    try {
      const folder = await this.foldersService.updateFolder(
        userId,
        folderId,
        updateFolderDto,
        request.accessToken
      );

      return {
        success: true,
        data: folder,
        message: "Folder updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error.message || "Failed to update folder",
      };
    }
  }

  @Delete(":id")
  async deleteFolder(
    @Param("id") folderId: string,
    @Req() request: any
  ): Promise<DeleteFolderResponse> {
    const userId = request.user.id;

    if (!folderId) {
      throw new BadRequestException("Folder ID is required");
    }

    try {
      await this.foldersService.deleteFolder(
        userId,
        folderId,
        request.accessToken
      );

      return {
        success: true,
        data: { deleted: true },
        message: "Folder deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: { deleted: false },
        message: error.message || "Failed to delete folder",
      };
    }
  }
}
