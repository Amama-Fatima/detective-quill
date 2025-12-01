// src/comments/comments.controller.ts

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
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import {
  CreateCommentDto,
  UpdateCommentDto,
} from "./validation/comment.validation";
import { AuthGuard } from "../auth/auth.guard";
import {
  CommentResponse,
  CommentStats,
  DeleteResponse,
  ApiResponse,
} from "@detective-quill/shared-types";

@Controller("comments")
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req
  ): Promise<ApiResponse<CommentResponse>> {
    try {
      console.log("Controller received createCommentDto:", createCommentDto); // Debug log
      const data = await this.commentsService.createComment(
        createCommentDto,
        req.user.id
      );
      return { success: true, data };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }

  @Get("node/:fsNodeId")
  async findByNode(
    @Param("fsNodeId") fsNodeId: string,
    @Request() req,
    @Query("includeResolved", new DefaultValuePipe(true), ParseBoolPipe)
    includeResolved: boolean
  ): Promise<ApiResponse<CommentResponse[]>> {
    try {
      const data = await this.commentsService.findCommentsByNode(
        fsNodeId,
        req.user.id,
        includeResolved
      );
      return { success: true, data };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }

  @Get("node/:fsNodeId/stats")
  async getNodeStats(
    @Param("fsNodeId") fsNodeId: string,
    @Request() req
  ): Promise<ApiResponse<CommentStats>> {
    try {
      const data = await this.commentsService.getCommentStats(
        fsNodeId,
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

  @Get(":id")
  async findOne(
    @Param("id") id: string,
    @Request() req
  ): Promise<ApiResponse<CommentResponse>> {
    try {
      const data = await this.commentsService.findCommentById(id, req.user.id);
      return { success: true, data };
    } catch (error) {
      if (error instanceof NotFoundException) {
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
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req
  ): Promise<ApiResponse<CommentResponse>> {
    try {
      const data = await this.commentsService.updateComment(
        id,
        updateCommentDto,
        req.user.id
      );
      return { success: true, data };
    } catch (error) {
      if (error instanceof NotFoundException) {
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
      const data = await this.commentsService.deleteComment(id, req.user.id);
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

  @Post(":id/resolve")
  async resolve(
    @Param("id") id: string,
    @Request() req
  ): Promise<ApiResponse<CommentResponse>> {
    try {
      const data = await this.commentsService.updateComment(
        id,
        { is_resolved: true },
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

  @Post(":id/unresolve")
  async unresolve(
    @Param("id") id: string,
    @Request() req
  ): Promise<ApiResponse<CommentResponse>> {
    try {
      const data = await this.commentsService.updateComment(
        id,
        { is_resolved: false },
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
