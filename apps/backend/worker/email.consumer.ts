import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { type EmailSendingJobData } from "@detective-quill/shared-types";
import { WorkerEmailService } from "../src/email/worker-email.service";
import { ConfigService } from "@nestjs/config";

// todo: add retry mechanism in here
@Controller()
export class EmailConsumer {
  constructor(private workerEmailService: WorkerEmailService, private configService: ConfigService) {}

  @EventPattern("invite_email_job")
  async handleInviteEmail(@Payload() data: EmailSendingJobData) {
    console.log("Email worker received job:", data);
    const { projectId, emails, inviterName, projectTitle } = data;
    const failed: string[] = [];
    for (const email of emails) {
      // generate a random string
      const inviteCode = Math.random().toString(36).substring(2);
      const inviteLink = `${this.configService.get("FRONTEND_URL")}/workspace/${projectId}/accept-invite?email=${encodeURIComponent(email)}&projectTitle=${projectTitle}&code=${inviteCode}`;
      console.log("Generated invite link:", inviteLink);
      try {
        const ok = await this.workerEmailService.sendEmail(
          inviteLink,
          email,
          inviterName,
          projectTitle,
          inviteCode,
          projectId
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
