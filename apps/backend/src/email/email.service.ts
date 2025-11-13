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
import { InvitationsService } from "src/invitations/invitations.service";
@Injectable()
export class EmailService implements OnModuleInit {
  constructor(
    private supabaseService: SupabaseService,
    private queueService: QueueService,
    private invitationsService: InvitationsService
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
    inviterName: string
  ): Promise<void> {
    await this.verifyProjectOwnership(projectId, userId);
    const projectTitle = await this.fetchProjectTitle(projectId);
    const registeredEmails = await this.verifyEmailsRegistered(emails);

    if (registeredEmails.length === 0) {
      console.log("No registered emails to send invitations to.");
      return;
    }

    this.queueService.sendInviteEmailsJob({
      projectId,
      emails: registeredEmails,
      inviterName,
      projectTitle,
    });
    return;
  }

  async sendEmail(
    inviteLink,
    toEmail: string,
    inviterName: string,
    projectTitle: string,
    inviteCode: string
  ): Promise<boolean> {
    if (!this.enabled) {
      console.log("Email service is disabled. Skipping email to", toEmail);
      return false;
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
      await this.invitationsService.addInvitation(projectTitle, inviteCode, toEmail);
      console.log("Invitation code stored for", toEmail);
      return true;
    } catch (err) {
      console.error("Error sending email:", err);
      return false;
    }
  }

  // Helper method to verify project ownership
  private async verifyProjectOwnership(
    projectId: string,
    userId: string
  ): Promise<void> {
    const supabase = this.supabaseService.client;

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

  private async fetchProjectTitle(projectId: string): Promise<string> {
    const supabase = this.supabaseService.client;
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

  // only return emails that are already registered users
  private async verifyEmailsRegistered(emails: string[]): Promise<string[]> {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .in("email", emails);
    if (error) {
      console.error("Error verifying emails:", error);
      return [];
    }
    return data.map((user) => user.email);
  }
}
