import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { type Invitation } from "@detective-quill/shared-types";
import { MembersService } from "../members/members.service";
import { ProjectsService } from "../projects/projects.service";
import { AdminSupabaseService } from "../supabase/admin-supabase.service";

@Injectable()
export class InvitationsService {
  constructor(
    private supabaseService: SupabaseService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private adminSupabaseService: AdminSupabaseService
  ) {}


  async respondToInvitation(
    projectId: string,
    inviteCode: string,
    response: "accept" | "reject"
  ): Promise<void> {
    const supabase = this.supabaseService.client;
    // insert member if accepted
    if (response === "accept") {
      const { data, error: fetchError } = await supabase
        .from("invitations")
        .select("email")
        .match({
          project_id: projectId,
          invite_code: inviteCode,
        })
        .single();
      if (fetchError || !data) {
        throw new Error(
          `Failed to fetch invitation details: ${fetchError?.message}`
        );
      }
      await this.membersService.addProjectMember(projectId, data.email);
    }
    const { error } = await supabase.from("invitations").delete().match({
      project_id: projectId,
      invite_code: inviteCode,
    });
    if (error) {
      throw new Error(`Failed to ${response} invitation: ${error.message}`);
    }

    return;
  }

  async getProjectInvitations(projectId: string): Promise<Invitation[]> {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("project_id", projectId);
    if (error) {
      throw new Error(`Failed to get project invitations: ${error.message}`);
    }
    return data || [];
  }

  async deleteInvitation(
    inviteCode: string,
    projectId: string,
    userId: string
  ): Promise<void> {
    // this user id is of the owner who has requested deletion not the invitee
    await this.projectsService.verifyProjectOwnership(projectId, userId);
    const supabase = this.supabaseService.client;
    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("invite_code", inviteCode);
    if (error) {
      throw new Error(`Failed to delete invitation: ${error.message}`);
    }
    return;
  }
}
