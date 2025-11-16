import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { type Invitation } from "@detective-quill/shared-types";
import { MembersService } from "../members/members.service";
import { ProjectsService } from "../projects/projects.service";

@Injectable()
export class InvitationsService {
  constructor(
    private supabaseService: SupabaseService,
    private membersService: MembersService,
    private projectsService: ProjectsService
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
        .eq("invite_code", inviteCode)
        .eq("project_id", projectId);

      if (fetchError) {
        throw new Error(
          `Failed to fetch invitation details: ${fetchError?.message}`
        );
      }
      if (!data || data.length === 0) {
        // explicit not found
        throw new NotFoundException("Invitation not found");
      }
      await this.membersService.addProjectMember(projectId, data[0].email);
    }
    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("project_id", projectId)
      .eq("invite_code", inviteCode);
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
