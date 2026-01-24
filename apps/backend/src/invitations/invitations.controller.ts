import {
  Controller,
  UseGuards,
  Request,
  Post,
  Delete,
  Body,
  Param,
} from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { ApiResponse } from "@detective-quill/shared-types";
import { InvitationsService } from "./invitations.service";
import {
  DeleteInvitationDto,
  RespondToInvitationDto,
} from "./dto/invitations.dto";

@Controller("invitations")
@UseGuards(AuthGuard)
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post(":inviteCode/respond")
  async respondToInvitation(
    @Param("inviteCode") inviteCode: string,
    @Body() body: RespondToInvitationDto,
  ): Promise<ApiResponse<void>> {
    const projectId = body.projectId;
    const response = body.response; // "accept" or "reject"
    await this.invitationsService.respondToInvitation(
      projectId,
      inviteCode,
      response,
    );
    return {
      success: true,
      message: `Invitation ${response}ed successfully`,
    };
  }

  @Delete(":inviteCode")
  async deleteInvitation(
    @Param("inviteCode") inviteCode: string,
    @Request() req,
    @Body() body: DeleteInvitationDto,
  ): Promise<ApiResponse<void>> {
    const projectId = body.projectId;
    const userId = req.user.id;
    await this.invitationsService.deleteInvitation(
      inviteCode,
      projectId,
      userId,
    );
    return {
      success: true,
      message: "Invitation deleted successfully",
    };
  }
}
