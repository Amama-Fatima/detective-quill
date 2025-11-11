import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  OnModuleInit,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { QueueService } from "src/queue/queue.service";
import { transporter, verifyTransporter } from "src/utils/email-transporter";
import { buildInviteEmail } from "src/utils/invite-email";

@Injectable()
export class EmailService implements OnModuleInit {
  constructor(
    private supabaseService: SupabaseService,
    private queueService: QueueService
  ) {}

  private enabled = true;

  async onModuleInit() {
    try {
      await verifyTransporter();
      console.log("Email transporter verified on module init");
    } catch (err) {
      this.enabled = false;
      console.error(
        "Email transporter verification failed on module init",
        err
      );
    }
  }

  // Invite new members to the project via email
  async inviteProjectMember(
    projectId: string,
    emails: string[],
    userId: string,
    accessToken: string,
    inviterName: string,
    inviterEmail: string
  ): Promise<void> {
    await this.verifyProjectOwnership(projectId, userId, accessToken);
    const projectTitle = await this.fetchProjectTitle(projectId, accessToken);
    this.queueService.sendInviteEmailsJob({
      projectId,
      emails,
      inviterName,
      inviterEmail,
      projectTitle,
    });
    return;
  }

  async sendEmail(
    inviteLink,
    toEmail: string,
    inviterName: string,
    projectTitle: string
  ) {
    if (!this.enabled) {
      console.log("Email service is disabled. Skipping email to", toEmail);
      return;
    }

    try {
      const mailOptions = buildInviteEmail({
        inviteLink,
        toEmail,
        inviterName,
        projectTitle,
      });
      await transporter.sendMail(mailOptions);
      console.log("Invitation email sent to", toEmail);
    } catch (err) {
      console.error("Error sending email:", err);
    }
  }

  // Helper method to verify project ownership
  private async verifyProjectOwnership(
    projectId: string,
    userId: string,
    accessToken: string
  ): Promise<void> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from("projects")
      .select("author_id")
      .eq("id", projectId)
      .single();

    if (error || !data) {
      throw new NotFoundException("Project not found");
    }

    if (data.author_id !== userId) {
      throw new ForbiddenException(
        "Only the project owner can perform this action"
      );
    }
  }

  private async fetchProjectTitle(
    projectId: string,
    accessToken: string
  ): Promise<string> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);
    const { data, error } = await supabase
      .from("projects")
      .select("title")
      .eq("id", projectId)
      .single();
    if (error || !data) {
      throw new NotFoundException("Project not found");
    }
    return data.title;
  }
}
