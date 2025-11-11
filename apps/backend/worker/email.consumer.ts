import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { type EmailSendingJobData } from "@detective-quill/shared-types";
import { EmailService } from "src/email/email.service";

// todo: add retry mechanism in here
@Controller()
export class EmailConsumer {
  constructor(private emailService: EmailService) {}

  @EventPattern("invite_email_job")
  async handleInviteEmail(@Payload() data: EmailSendingJobData) {
    console.log("Email worker received job:", data);
    const { projectId, emails, inviterName, projectTitle } = data;
    const failed: string[] = [];
    for (const email of emails) {
      const inviteLink = `${process.env.FRONTEND_URL}/projects/${projectId}/accept-invite?email=${encodeURIComponent(email)}`;
      try {
        const ok = await this.emailService.sendEmail(
          inviteLink,
          email,
          inviterName,
          projectTitle
        );

        if (!ok) {
          failed.push(email);
        }
      } catch (err) {
        console.error(`Error sending invite email to ${email}:`, err);
        failed.push(email);
      }
    }

    if (failed.length > 0) {
      console.error(`Failed to send invite emails to: ${failed.join(", ")}`);
    }
  }
}
