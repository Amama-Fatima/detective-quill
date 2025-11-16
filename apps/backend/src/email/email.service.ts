import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { QueueService } from "../queue/queue.service";

@Injectable()
export class EmailService {
  constructor(
    private supabaseService: SupabaseService,
    private queueService: QueueService
  ) {}

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
