import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { type EmailSendingJobData } from "@detective-quill/shared-types";
import { EmailService } from "src/email/email.service";
@Controller()
export class EmailConsumer {
  constructor(private emailService: EmailService) {}

  @EventPattern("invite_email_job")
  async handleInviteEmail(@Payload() data: EmailSendingJobData) {
    const { projectId, emails, inviterName, inviterEmail, projectTitle } = data;

    for (const email of emails) {
      const inviteLink = `${process.env.FRONTEND_URL}/projects/${projectId}/accept-invite?email=${encodeURIComponent(email)}`;
      await this.emailService.sendEmail(
        inviteLink,
        email,
        inviterName,
        projectTitle
      );
    }

    console.log("Email worker received job:", data);
  }
}
