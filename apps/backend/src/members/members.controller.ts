import { Controller, Param, Delete, UseGuards, Request, NotFoundException, InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { MembersService } from "./members.service";
import { AuthGuard } from "../auth/auth.guard";
import type { ApiResponse } from "@detective-quill/shared-types";

@Controller("projects/:projectId/members")
@UseGuards(AuthGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  // Remove a member
  @Delete(":memberId")
  async removeProjectMember(
    @Param("projectId") projectId: string,
    @Param("memberId") memberId: string,
    @Request() req
  ): Promise<ApiResponse<void>> {
    try {
      await this.membersService.removeProjectMember(
        projectId,
        memberId,
        req.user.id
      );
      return { success: true, message: "Member removed successfully" };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to remove member: ${error.message}`
      );
    }
  }
}
