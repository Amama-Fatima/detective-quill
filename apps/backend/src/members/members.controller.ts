import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { MembersService } from "./members.service";
import { AuthGuard } from "../auth/auth.guard";
import type { ApiResponse, ProjectMember } from "@detective-quill/shared-types";
import { AddMemberDto } from "./dto/members.dto";

@Controller("projects/:projectId/members")
@UseGuards(AuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // Add a new member
  @Post("members")
  async addProjectMember(
    @Param("projectId") projectId: string,
    @Body() member: AddMemberDto,
    @Request() req
  ): Promise<ApiResponse<ProjectMember>> {
    try {
      const data = await this.membersService.addProjectMember(
        projectId,
        member,
        req.user.id,
      );
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Remove a member
  @Delete("members/:memberId")
  async removeProjectMember(
    @Param("projectId") projectId: string,
    @Param("memberId") memberId: string,
    @Request() req
  ): Promise<ApiResponse<void>> {
    try {
      await this.membersService.removeProjectMember(
        projectId,
        memberId,
        req.user.id,
      );
      return { success: true, message: "Member removed successfully" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
