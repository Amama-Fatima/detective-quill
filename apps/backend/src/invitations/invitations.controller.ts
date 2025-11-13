import {
  Controller,
  Get,
  UseGuards,
  Request,
  Post,
  Delete,
  Body,
} from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import { ApiResponse, type Invitation } from "@detective-quill/shared-types";
import { InvitationsService } from "./invitations.service";

@Controller("invitations")
@UseGuards(AuthGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Get(":projectId")
  async getProjectInvitations(
    @Request() req
  ): Promise<ApiResponse<Invitation[]>> {
    const projectId = req.params.projectId;
    try {
      const invitations =
        await this.invitationsService.getProjectInvitations(projectId);
      return {
        success: true,
        message: "Project invitations retrieved successfully",
        data: invitations,
      };
    } catch (error) {
      return {
        success: false,
        message: "Error retrieving project invitations: " + error.message,
      };
    }
  }

  @Post(":inviteCode/respond")
  async respondToInvitation(
    @Request() req,
    @Body() body: { response: "accept" | "reject"; projectId: string }
  ): Promise<ApiResponse<void>> {
    const projectId = body.projectId;
    const inviteCode = req.params.inviteCode;
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
      return { success: false, message: error.message };
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
      return { success: false, message: error.message };
    }
  }
}
