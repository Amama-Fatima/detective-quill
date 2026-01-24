import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { ProjectsService } from "src/projects/projects.service";

@Injectable()
export class MembersService {
  constructor(
    private supabaseService: SupabaseService,
    private projectsService: ProjectsService,
  ) {}

  // Add a new member to the project
  async addProjectMemberWithEmail(
    projectId: string,
    email: string,
  ): Promise<void> {
    const supabase = this.supabaseService.client;
    // First, find the user by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, full_name, username, email, avatar_url")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    // Check if user is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from("projects_members")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", profile.user_id)
      .single();

    if (existingMember) {
      throw new Error("User is already a member of this project");
    }

    // Add the member
    const { data, error } = await supabase
      .from("projects_members")
      .insert({
        project_id: projectId,
        user_id: profile.user_id,
        is_author: false,
      })
      .single();

    if (error) {
      throw new Error(`Failed to add member: ${error.message}`);
    }
    return;
  }

  // Remove a member from the project
  async removeProjectMember(
    projectId: string,
    memberId: string,
    userId: string,
  ): Promise<void> {
    const supabase = this.supabaseService.client;

    // Verify the user is the project owner
    await this.projectsService.verifyProjectOwnership(projectId, userId);

    // Check if the member exists and get their details
    const { data: member, error: memberError } = await supabase
      .from("projects_members")
      .select("user_id")
      .eq("user_id", memberId)
      .eq("project_id", projectId)
      .single();

    if (memberError || !member) {
      throw new NotFoundException("Member not found in this project");
    }

    // Prevent removing the project owner
    if (member.user_id === userId) {
      throw new BadRequestException(
        "Project owner cannot be removed from the project",
      );
    }

    // Remove the member
    const { error } = await supabase
      .from("projects_members")
      .delete()
      .eq("user_id", memberId)
      .eq("project_id", projectId);

    if (error) {
      throw new BadRequestException(
        `Failed to remove member: ${error.message}`,
      );
    }

    return;
  }

  // verify project access (owner or member)
  async verifyProjectAccess(
    projectId: string,
    userId: string,
  ): Promise<{ hasAccess: boolean; role: "owner" | "member" | null }> {
    const supabase = this.supabaseService.client;

    // Check if user is the owner
    const { data: project } = await supabase
      .from("projects")
      .select("author_id")
      .eq("id", projectId)
      .single();

    if (project?.author_id === userId) {
      return { hasAccess: true, role: "owner" };
    }

    // Check if user is a member
    const { data: member, error } = await supabase
      .from("projects_members")
      .select("user_id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single();

    if (!member) {
      return { hasAccess: false, role: null };
    }

    return { hasAccess: true, role: "member" };
  }
}
