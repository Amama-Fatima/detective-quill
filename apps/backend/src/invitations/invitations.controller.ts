import {
  Controller,
  UseGuards,
  Request,
  Post,
  Delete,
  Body,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { ApiResponse } from "@detective-quill/shared-types";
import { InvitationsService } from "./invitations.service";

@Controller("invitations")
@UseGuards(AuthGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post(":inviteCode/respond")
  async respondToInvitation(
    @Request() req,
    @Param("inviteCode") inviteCode: string,
    @Body() body: { response: "accept" | "reject"; projectId: string }
  ): Promise<ApiResponse<void>> {
    const projectId = body.projectId;
    const response = body.response; // "accept" or "reject"
    try {
      await this.invitationsService.respondToInvitation(
        projectId,
        inviteCode,
        response
      );
      return {
        success: true,
        message: `Invitation ${response}ed successfully`,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }

  @Delete(":inviteCode")
  async deleteInvitation(
    @Request() req,
    @Body() body: { projectId: string }
  ): Promise<ApiResponse<void>> {
    const projectId = body.projectId;
    const inviteCode = req.params.inviteCode;
    const userId = req.user.id;
    try {
      await this.invitationsService.deleteInvitation(
        inviteCode,
        projectId,
        userId
      );
      return {
        success: true,
        message: "Invitation deleted successfully",
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get project invitations: ${error.message}`
      );
    }
  }
}
