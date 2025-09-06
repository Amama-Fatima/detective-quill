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
      const data = await this.commentsService.createComment(
        createCommentDto,
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
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
        req.accessToken,
        includeResolved
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
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
  ): Promise<ApiResponse<CommentResponse>> {
    try {
      const data = await this.commentsService.findCommentById(
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
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req
  ): Promise<ApiResponse<CommentResponse>> {
    try {
      const data = await this.commentsService.updateComment(
        id,
        updateCommentDto,
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
    @Request() req
  ): Promise<ApiResponse<DeleteResponse>> {
    try {
      const data = await this.commentsService.deleteComment(
        id,
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
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
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
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
        req.user.id,
        req.accessToken
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
