// apps/backend/src/chapters/chapters.controller.ts
import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  BadRequestException,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import {
  type GetChaptersQuery,
  type GetChaptersResponse,
} from "@detective-quill/shared-types";
import { ChaptersService } from "./chapters.service";

@Controller("chapters")
@UseGuards(AuthGuard)
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

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
      const chapters =
        await this.chaptersService.getChaptersByUserAndProjectTitle(
          userId,
          projectTitle,
          request.accessToken
        );

      return {
        success: true,
        data: chapters,
        message: `Found ${chapters.length} chapters for project "${projectTitle}"`,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error.message || "Failed to fetch chapters",
      };
    }
  }
}
