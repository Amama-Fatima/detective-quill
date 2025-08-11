import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import {
  type GetChaptersQuery,
  type GetChaptersResponse,
  type CreateChapterDto,
  type CreateChapterResponse,
  type UpdateChapterDto,
  type UpdateChapterResponse,
  type GetWorkspaceResponse,
} from "@detective-quill/shared-types";
import { ChaptersService } from "./chapters.service";

@Controller("chapters")
@UseGuards(AuthGuard)
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  // Updated to use the new workspace data endpoint
  @Get()
  async getChapters(
    @Query() query: GetChaptersQuery,
    @Req() request: any
  ): Promise<GetChaptersResponse> {
    const { projectTitle } = query;
    const userId = request.user.id;

    if (!projectTitle) {
      throw new BadRequestException("Project title is required");
    }

    try {
      const workspaceData = await this.chaptersService.getWorkspaceData(
        userId,
        projectTitle,
        request.accessToken
      );

      return {
        success: true,
        data: workspaceData.chapters,
        message: `Found ${workspaceData.chapters.length} chapters for project "${projectTitle}"`,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || "Failed to fetch chapters",
      };
    }
  }

  // New endpoint for getting complete workspace data (chapters + folders)
  @Get("workspace")
  async getWorkspaceData(
    @Query() query: GetChaptersQuery,
    @Req() request: any
  ): Promise<GetWorkspaceResponse> {
    const { projectTitle } = query;
    const userId = request.user.id;

    if (!projectTitle) {
      throw new BadRequestException("Project title is required");
    }

    try {
      const workspaceData = await this.chaptersService.getWorkspaceData(
        userId,
        projectTitle,
        request.accessToken
      );

      return {
        success: true,
        data: workspaceData,
        message: `Found ${workspaceData.chapters.length} chapters and ${workspaceData.folders.length} folders for project "${projectTitle}"`,
      };
    } catch (error) {
      return {
        success: false,
        data: { chapters: [], folders: [] },
        message: error.message || "Failed to fetch workspace data",
      };
    }
  }

  @Post()
  async createChapter(
    @Body() createChapterDto: CreateChapterDto,
    @Req() request: any
  ): Promise<CreateChapterResponse> {
    const { projectTitle, title, content, chapterOrder, folderId } =
      createChapterDto;
    const userId = request.user.id;

    if (!projectTitle || !title || chapterOrder === undefined) {
      throw new BadRequestException(
        "Project title, chapter title, and chapter order are required"
      );
    }

    try {
      const chapter = await this.chaptersService.createChapter(
        userId,
        projectTitle,
        {
          title,
          content: content || "",
          chapterOrder,
          folderId: folderId || null, // Add folder support
        },
        request.accessToken
      );

      return {
        success: true,
        data: chapter,
        message: `Chapter "${title}" created successfully`,
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error.message || "Failed to create chapter",
      };
    }
  }

  @Put(":id")
  async updateChapter(
    @Param("id") chapterId: string,
    @Body() updateChapterDto: Omit<UpdateChapterDto, "id">,
    @Req() request: any
  ): Promise<UpdateChapterResponse> {
    const userId = request.user.id;

    if (!chapterId) {
      throw new BadRequestException("Chapter ID is required");
    }

    try {
      const chapter = await this.chaptersService.updateChapter(
        userId,
        chapterId,
        {
          ...updateChapterDto,
          // Handle folderId properly (can be null to remove from folder)
          folderId:
            updateChapterDto.folderId !== undefined
              ? updateChapterDto.folderId
              : undefined,
        },
        request.accessToken
      );

      return {
        success: true,
        data: chapter,
        message: "Chapter updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        data: null as any,
        message: error.message || "Failed to update chapter",
      };
    }
  }
}
