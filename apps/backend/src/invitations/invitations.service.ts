import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { MembersService } from "../members/members.service";
import { ProjectsService } from "../projects/projects.service";
import { BadgesNStatsService } from "src/badges_n_stats/badges_n_stats.service";
import { type CreateEventDto } from "@detective-quill/shared-types";

@Injectable()
export class InvitationsService {
  constructor(
    private supabaseService: SupabaseService,
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private badgesNStatsService: BadgesNStatsService,
  ) {}

  async respondToInvitation(
    projectId: string,
    inviteCode: string,
    response: "accept" | "reject",
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
          `Failed to fetch invitation details: ${fetchError?.message}`,
        );
      }
      if (!data || data.length === 0) {
        // explicit not found
        throw new NotFoundException("Invitation not found");
      }
      const invitedUserId = await this.membersService.addProjectMemberWithEmail(
        projectId,
        data[0].email,
      );

      await this.badgesNStatsService.increaseProjectsInvitedTo(invitedUserId);

      const eventData: CreateEventDto = {
        user_id: invitedUserId,
        source_table: "invitations",
        source_id: null,
        event_type: "invitation_accepted",
        xp: 10,
        metadata: {
          project_id: projectId,
          invite_code: inviteCode,
          response: "accept",
        },
      };

      await this.badgesNStatsService.createEvent(eventData);
      await this.badgesNStatsService.updateTotalXp(invitedUserId, 10);
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

  // this deletes an invitation, only the project owner can do this
  async deleteInvitation(
    inviteCode: string,
    projectId: string,
    userId: string,
  ): Promise<void> {
    // this user id is of the owner who has requested deletion not the invitee who was invited
    await this.projectsService.verifyProjectOwnership(projectId, userId);
    const supabase = this.supabaseService.client;
    const { error } = await supabase
      .from("invitations")
      .delete()
      .eq("invite_code", inviteCode)
      .eq("project_id", projectId);
    if (error) {
      throw new Error(`Failed to delete invitation: ${error.message}`);
    }
    return;
  }
}
