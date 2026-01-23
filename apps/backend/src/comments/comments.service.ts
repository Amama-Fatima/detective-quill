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
    userId: string,
  ): Promise<CommentResponse> {
    const supabase = this.supabaseService.client;

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
      `,
      );

    if (error) {
      throw new Error(`Failed to create comment: ${error.message}`);
    }

    return data[0];
  }

  async findCommentsByNode(
    fsNodeId: string,
    userId: string,
    includeResolved: boolean = true,
  ): Promise<CommentResponse[]> {
    const supabase = this.supabaseService.client;
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
      `,
      )
      .eq("fs_node_id", fsNodeId)
      .order("created_at", { ascending: true });

    if (!includeResolved) {
      query = query.eq("is_resolved", false);
    }

    const { data, error } = await query;

    if (error) {
      console.log("Error fetching comments:", error);
      throw new BadRequestException(
        `Failed to fetch comments: ${error.message}`,
      );
    }

    return data || [];
  }

  async findCommentById(commentId: string): Promise<CommentWithRelations> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("id", commentId);

    if (error || !data) {
      throw new NotFoundException("Comment not found");
    }

    return data[0];
  }

  async updateComment(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponse> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from("comments")
      .update({
        ...updateCommentDto,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .select("*")
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to update comment: ${error.message}`,
      );
    }

    return data;
  }

  async deleteComment(commentId: string): Promise<DeleteResponse> {
    const supabase = this.supabaseService.client;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      throw new BadRequestException(
        `Failed to delete comment: ${error.message}`,
      );
    }

    return { message: "Comment deleted successfully" };
  }

  async getCommentStats(fsNodeId: string): Promise<CommentStats> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from("comments")
      .select("is_resolved")
      .eq("fs_node_id", fsNodeId);

    if (error) {
      throw new BadRequestException(
        `Failed to get comment stats: ${error.message}`,
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

  async isCommentAuthor(commentId: string, userId: string): Promise<boolean> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from("comments")
      .select("author_id")
      .eq("id", commentId);

    if (error || !data) {
      throw new NotFoundException("Comment not found");
    }

    const comment = data[0];
    return comment.author_id === userId;
  }
}
