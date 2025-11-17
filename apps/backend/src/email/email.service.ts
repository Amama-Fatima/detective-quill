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
    const registeredUsers = await this.verifyRegisteredUsers(emails);
    let notInvitedUsers = await this.getUsersNotInvited(
      projectId,
      registeredUsers
    );
    if (notInvitedUsers.length === 0) {
      console.log("No registered emails to send invitations to.");
      return;
    }


    for (const user of notInvitedUsers) {
      const isMember = await this.verifyProjectMembership(
        projectId,
        user.user_id
      );

      if (isMember) {
        notInvitedUsers = notInvitedUsers.filter(
          (u) => u.email !== user.email
        );
      }
    }

    const notInvitedEmails = notInvitedUsers.map((u) => u.email);
    if (notInvitedEmails.length === 0) {
      console.log("No emails to send invitations to after filtering members.");
      return;
    }

    this.queueService.sendInviteEmailsJob({
      projectId,
      emails: notInvitedEmails,
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

  // only return emails and user id of users that are already registered users
  private async verifyRegisteredUsers(
    emails: string[]
  ): Promise<{ email: string; user_id: string }[]> {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("profiles")
      .select("email, user_id")
      .in("email", emails);
    if (error) {
      console.error("Error verifying emails:", error);
      return [];
    }
    return data;
  }

  // verify if email is not already invited to the project or is not already part of the project
  private async getUsersNotInvited(
    projectId: string,
    user_emails: { email: string; user_id: string }[]
  ): Promise<{ email: string; user_id: string }[]> {
    const supabase = this.supabaseService.client;

    // Fetch emails that ARE already invited or members
    const { data, error } = await supabase
      .from("projects_members")
      .select("user_id")
      .eq("project_id", projectId)
      .in(
        "user_id",
        user_emails.map((u) => u.user_id)
      );

    if (error) {
      console.error("Error verifying emails:", error);
      return [];
    }

    const alreadyInProject = data.map((m) => m.user_id);

    // Filter OUT emails that already exist
    const notInvited = user_emails.filter(
      (u_e) => !alreadyInProject.includes(u_e.user_id)
    );

    return notInvited;
  }

  private async verifyProjectMembership(
    projectId: string,
    userId: string
  ): Promise<boolean> {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("projects_members")
      .select("user_id")
      .eq("project_id", projectId)
      .eq("user_id", userId);

    if (error || !data || data.length === 0) {
      return false;
    }
    return true;
  }
}
