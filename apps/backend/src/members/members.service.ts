import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { ProjectMember, AddMemberDto } from "@detective-quill/shared-types";

@Injectable()
export class MembersService {
  constructor(
    private supabaseService: SupabaseService,
  ) {}

  // Add a new member to the project
  async addProjectMember(
    projectId: string,
    member: AddMemberDto,
    userId: string,
    accessToken: string
  ): Promise<ProjectMember> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verify the user is the project owner
    await this.verifyProjectOwnership(projectId, userId, accessToken);

    // First, find the user by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, full_name, username, email, avatar_url")
      .eq("email", member.email)
      .single();

    if (profileError || !profile) {
      throw new NotFoundException(
        `User with email ${member.email} not found`
      );
    }

    // Check if user is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from("projects_members")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", profile.user_id)
      .single();

    if (existingMember) {
      throw new BadRequestException("User is already a member of this project");
    }

    // Add the member
    const { data, error } = await supabase
      .from("projects_members")
      .insert({
        project_id: projectId,
        user_id: profile.user_id,
      })
      .select(
        `
        project_id,
        user_id,
        created_at
      `
      )
      .single();

    if (error) {
      throw new BadRequestException(`Failed to add member: ${error.message}`);
    }

    // Return the member with profile info
    return {
      ...data,
      full_name: profile.full_name ?? profile.username ?? null,
      username: profile.username ?? null,
      email: profile.email,
      avatar_url: profile.avatar_url ?? null,
    };
  }

  // Remove a member from the project
  async removeProjectMember(
    projectId: string,
    memberId: string,
    userId: string,
    accessToken: string
  ): Promise<void> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verify the user is the project owner
    await this.verifyProjectOwnership(projectId, userId, accessToken);

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
        "Project owner cannot be removed from the project"
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
        `Failed to remove member: ${error.message}`
      );
    }

    return;
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

  // Helper method to verify project access (owner or member)
  // private async verifyProjectAccess(
  //   projectId: string,
  //   userId: string,
  //   accessToken: string
  // ): Promise<void> {
  //   const supabase = this.supabaseService.getClientWithAuth(accessToken);

  //   // Check if user is the owner
  //   const { data: project } = await supabase
  //     .from("projects")
  //     .select("author_id")
  //     .eq("id", projectId)
  //     .single();

  //   if (project?.author_id === userId) {
  //     return; // User is the owner
  //   }

  //   // Check if user is a member
  //   const { data: member } = await supabase
  //     .from("projects_members")
  //     .select("id")
  //     .eq("project_id", projectId)
  //     .eq("user_id", userId)
  //     .single();

  //   if (!member) {
  //     throw new ForbiddenException("Access denied to this project");
  //   }
  // }
}
