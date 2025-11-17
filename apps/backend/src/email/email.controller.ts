import { Controller, Post, UseGuards, Request, Body } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { EmailService } from "./email.service";
import { type EmailSendingApiRequestDto } from "./dto/email.dto";
import { ApiResponse } from "@detective-quill/shared-types";

@Controller("email")
@UseGuards(AuthGuard)
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post("send-invite")
  async sendInviteEmails(
    @Body() body: EmailSendingApiRequestDto,
    @Request() req
  ): Promise<ApiResponse<void>> {
    try {
      // get all the values from body
      const { projectId, emails, inviterName } = body;
      await this.emailService.inviteProjectMember(
        projectId,
        emails,
        req.user.id,
        inviterName,
      );
      return { success: true, message: "Invitations sent successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
