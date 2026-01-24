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
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { MembersService } from "src/members/members.service";
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

@Controller(":projectId/comments")
@UseGuards(AuthGuard)
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly membersService: MembersService,
  ) {}

  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Request() req,
  ): Promise<ApiResponse<CommentResponse>> {
      if (createCommentDto.start_offset > createCommentDto.end_offset) {
        throw new BadRequestException(
          "Start_offset cannot be greater than end_offset",
        );
      }

      const { hasAccess } = await this.membersService.verifyProjectAccess(
        createCommentDto.project_id,
        req.user.id,
      );

      if (!hasAccess) {
        throw new ForbiddenException("You do not have access to this project.");
      }

      const data = await this.commentsService.createComment(
        createCommentDto,
        req.user.id,
      );

      return { success: true, data };
  }

  @Get(":fsNodeId")
  async findByNode(
    @Param("projectId") projectId: string,
    @Param("fsNodeId") fsNodeId: string,
    @Request() req,
    @Query("includeResolved", new DefaultValuePipe(true), ParseBoolPipe)
    includeResolved: boolean,
  ): Promise<ApiResponse<CommentResponse[]>> {
      const { hasAccess } = await this.membersService.verifyProjectAccess(
        projectId,
        req.user.id,
      );

      if (!hasAccess) {
        throw new ForbiddenException("You do not have access to this project.");
      }

      const data = await this.commentsService.findCommentsByNode(
        fsNodeId,
        req.user.id,
        includeResolved,
      );
      return { success: true, data };
  }

  @Get(":fsNodeId/stats")
  async getNodeStats(
    @Param("projectId") projectId: string,
    @Param("fsNodeId") fsNodeId: string,
    @Request() req,
  ): Promise<ApiResponse<CommentStats>> {
      const { hasAccess } = await this.membersService.verifyProjectAccess(
        projectId,
        req.user.id,
      );

      if (!hasAccess) {
        throw new ForbiddenException("You do not have access to this project.");
      }

      const data = await this.commentsService.getCommentStats(fsNodeId);
      return { success: true, data };
    
  }

  @Get(":id")
  async findOne(
    @Param("projectId") projectId: string,
    @Param("id") id: string,
    @Request() req,
  ): Promise<ApiResponse<CommentResponse>> {
      const { hasAccess } = await this.membersService.verifyProjectAccess(
        projectId,
        req.user.id,
      );

      if (!hasAccess) {
        throw new ForbiddenException("You do not have access to this project.");
      }

      const data = await this.commentsService.findCommentById(id);
      return { success: true, data };
    
  }

  @Patch(":id")
  async update(
    @Param("projectId") projectId: string,
    @Param("id") id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ): Promise<ApiResponse<CommentResponse>> {
      const { hasAccess, role } = await this.membersService.verifyProjectAccess(
        projectId,
        req.user.id,
      );

      if (!hasAccess) {
        throw new ForbiddenException("You do not have access to this project.");
      }

      const isCommentAuthor = await this.commentsService.isCommentAuthor(
        id,
        req.user.id,
      );
      const isProjectOwner = role === "owner";

      if (updateCommentDto.content && !isCommentAuthor) {
        throw new ForbiddenException("Only comment author can edit content");
      }

      if (
        updateCommentDto.is_resolved !== undefined &&
        !isCommentAuthor &&
        !isProjectOwner
      ) {
        throw new ForbiddenException(
          "Only comment author or project owner can resolve comments",
        );
      }

      const data = await this.commentsService.updateComment(
        id,
        updateCommentDto,
      );
      return { success: true, data };
    
  }

  @Delete(":id")
  async remove(
    @Param("projectId") projectId: string,
    @Param("id") id: string,
    @Request() req,
  ): Promise<ApiResponse<DeleteResponse>> {
      const { hasAccess, role } = await this.membersService.verifyProjectAccess(
        projectId,
        req.user.id,
      );

      if (!hasAccess) {
        throw new ForbiddenException("You do not have access to this project.");
      }

      const isCommentAuthor = await this.commentsService.isCommentAuthor(
        id,
        req.user.id,
      );

      const isProjectOwner = role === "owner";
      if (!isCommentAuthor && !isProjectOwner) {
        throw new ForbiddenException(
          "Only comment author or project owner can delete comments",
        );
      }

      const data = await this.commentsService.deleteComment(id);
      return { success: true, data };
  
  }

  @Post(":id/resolve")
  async resolve(
    @Param("projectId") projectId: string,
    @Param("id") id: string,
    @Request() req,
  ): Promise<ApiResponse<CommentResponse>> {
      const { hasAccess, role } = await this.membersService.verifyProjectAccess(
        projectId,
        req.user.id,
      );

      if (!hasAccess) {
        throw new ForbiddenException(
          "You do not have access to comment on this project.",
        );
      }

      const isCommentAuthor = await this.commentsService.isCommentAuthor(
        id,
        req.user.id,
      );

      const isProjectOwner = role === "owner";
      if (!isCommentAuthor && !isProjectOwner) {
        throw new ForbiddenException(
          "Only comment author or project owner can resolve comments",
        );
      }

      const data = await this.commentsService.updateComment(id, {
        is_resolved: true,
      });
      return { success: true, data };
   
  }

  // @Post("/:projectId/:id/unresolve")
  // async unresolve(
  //   @Param("projectId") projectId: string,
  //   @Param("id") id: string,
  //   @Request() req,
  // ): Promise<ApiResponse<CommentResponse>> {
  //   try {
  //     const data = await this.commentsService.updateComment(
  //       id,
  //       { is_resolved: false },
  //       req.user.id,
  //     );
  //     return { success: true, data };
  //   } catch (error) {
  //     if (error instanceof NotFoundException) {
  //       throw error;
  //     }
  //     if (error instanceof ForbiddenException) {
  //       throw error;
  //     }
  //     throw new InternalServerErrorException(
  //       `Failed to unresolve comment: ${error.message}`,
  //     );
  //   }
  // }
}
