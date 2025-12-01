// src/comments/comments.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  CreateCommentDto,
  UpdateCommentDto,
  CommentResponse,
  CommentWithRelations,
  CommentStats,
  DeleteResponse,
} from "@detective-quill/shared-types";

// todo: add verfication checks in proper middlewares

@Injectable()
export class CommentsService {
  constructor(private supabaseService: SupabaseService) {}

  async createComment(
    createCommentDto: CreateCommentDto,
    userId: string
  ): Promise<CommentResponse> {
    const supabase = this.supabaseService.client;

    // First verify the fs_node exists and user has access
    await this.verifyNodeAccess(createCommentDto.fs_node_id, userId);

    // Validate selection range
    if (createCommentDto.start_offset > createCommentDto.end_offset) {
      throw new BadRequestException(
        "start_offset cannot be greater than end_offset"
      );
    }

    const { data, error } = await supabase
      .from("comments")
      .insert({
        fs_node_id: createCommentDto.fs_node_id,
        block_id: createCommentDto.block_id,
        start_offset: createCommentDto.start_offset,
        end_offset: createCommentDto.end_offset,
        content: createCommentDto.content,
        author_id: userId,
        selected_text: createCommentDto.selected_text,
      })
      .select(
        `
        *,
        author:profiles!author_id (
          user_id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to create comment: ${error.message}`
      );
    }

    return data;
  }

  async findCommentsByNode(
    fsNodeId: string,
    userId: string,
    includeResolved: boolean = true
  ): Promise<CommentResponse[]> {
    const supabase = this.supabaseService.client;

    // Verify user has access to the node
    await this.verifyNodeAccess(fsNodeId, userId);

    let query = supabase
      .from("comments")
      .select(
        `
        *,
        author:profiles!author_id (
          user_id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .eq("fs_node_id", fsNodeId)
      .order("created_at", { ascending: true });

    if (!includeResolved) {
      query = query.eq("is_resolved", false);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(
        `Failed to fetch comments: ${error.message}`
      );
    }

    return data || [];
  }

  async findCommentById(
    commentId: string,
    userId: string
  ): Promise<CommentWithRelations> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from("comments")
      .select(
        `
        *,
        author:profiles!author_id (
          user_id,
          username,
          full_name,
          avatar_url
        ),
        fs_node:fs_nodes!fs_node_id (
          project_id,
          project:projects!project_id(author_id)
        )
      `
      )
      .eq("id", commentId)
      .single();

    if (error || !data) {
      throw new NotFoundException("Comment not found");
    }

    // Verify user has access (either author of comment or project owner)
    const project = Array.isArray(data.fs_node?.project)
      ? data.fs_node.project[0]
      : data.fs_node?.project;
    const projectAuthorId = project?.author_id;

    if (data.author_id !== userId && projectAuthorId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    return data;
  }

  async updateComment(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
    userId: string
  ): Promise<CommentResponse> {
    const supabase = this.supabaseService.client;

    // First verify the comment exists and user has permission
    const existingComment = await this.findCommentById(commentId, userId);

    // Only allow author to update content, but project owner can resolve
    const project = Array.isArray(existingComment.fs_node?.project)
      ? existingComment.fs_node.project[0]
      : existingComment.fs_node?.project;
    const projectAuthorId = project?.author_id;
    const isCommentAuthor = existingComment.author_id === userId;
    const isProjectOwner = projectAuthorId === userId;

    if (updateCommentDto.content && !isCommentAuthor) {
      throw new ForbiddenException("Only comment author can edit content");
    }

    if (
      updateCommentDto.is_resolved !== undefined &&
      !isCommentAuthor &&
      !isProjectOwner
    ) {
      throw new ForbiddenException(
        "Only comment author or project owner can resolve comments"
      );
    }

    const { data, error } = await supabase
      .from("comments")
      .update({
        ...updateCommentDto,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .select(
        `
        *,
        author:profiles!author_id (
          user_id,
          username,
          full_name,
          avatar_url
        )
      `
      )
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to update comment: ${error.message}`
      );
    }

    return data;
  }

  async deleteComment(
    commentId: string,
    userId: string
  ): Promise<DeleteResponse> {
    const supabase = this.supabaseService.client;

    // Verify comment exists and user has permission
    const comment = await this.findCommentById(commentId, userId);

    // Only comment author or project owner can delete
    const project = Array.isArray(comment.fs_node?.project)
      ? comment.fs_node.project[0]
      : comment.fs_node?.project;
    const projectAuthorId = project?.author_id;

    if (comment.author_id !== userId && projectAuthorId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      throw new BadRequestException(
        `Failed to delete comment: ${error.message}`
      );
    }

    return { message: "Comment deleted successfully" };
  }

  async getCommentStats(
    fsNodeId: string,
    userId: string
  ): Promise<CommentStats> {
    const supabase = this.supabaseService.client;

    // Verify user has access to the node
    await this.verifyNodeAccess(fsNodeId, userId);

    const { data, error } = await supabase
      .from("comments")
      .select("is_resolved")
      .eq("fs_node_id", fsNodeId);

    if (error) {
      throw new BadRequestException(
        `Failed to get comment stats: ${error.message}`
      );
    }

    const total = data?.length || 0;
    const resolved = data?.filter((comment) => comment.is_resolved).length || 0;
    const unresolved = total - resolved;

    return {
      total,
      resolved,
      unresolved,
    };
  }

  private async verifyNodeAccess(
    fsNodeId: string,
    userId: string
  ): Promise<void> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from("fs_nodes")
      .select(
        `
        id,
        project:projects!project_id (
          author_id
        )
      `
      )
      .eq("id", fsNodeId)
      .single();

    if (error || !data) {
      throw new NotFoundException("File not found");
    }

    // Handle the fact that project might be an array
    const project = Array.isArray(data.project)
      ? data.project[0]
      : data.project;
    if (project?.author_id !== userId) {
      throw new ForbiddenException("Access denied");
    }
  }
}
