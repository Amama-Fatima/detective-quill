import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  UpdateProjectDto,
  ProjectResponse,
  DeleteResponse,
  ProjectMember,
  AddMemberDto,
} from "@detective-quill/shared-types";

@Injectable()
export class SettingsService {
  constructor(private supabaseService: SupabaseService) {}

  // Update project information (title, description)
  async updateProjectInfo(
    projectId: string,
    updateData: UpdateProjectDto,
    userId: string,
    accessToken: string
  ): Promise<ProjectResponse> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // First verify the user is the project owner
    await this.verifyProjectOwnership(projectId, userId, accessToken);

    const { data, error } = await supabase
      .from("projects")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to update project: ${error.message}`
      );
    }

    return data;
  }

  // Get all project members with their profile information
  async getProjectMembers(
    projectId: string,
    userId: string,
    accessToken: string
  ): Promise<ProjectMember[]> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verify user has access to this project (either owner or member)
    await this.verifyProjectAccess(projectId, userId, accessToken);

    const { data, error } = await supabase
      .from("projects_members")
      .select(
        `
        project_id,
        user_id,
        created_at,
        profile:profiles!projects_members_user_id_fkey (
          id,
          full_name,
          username,
          email,
          avatar_url
        )
      `
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch project members: ${error.message}`
      );
    }
    console.log("data in here is ", data);
    return (data as unknown as ProjectMember[]) || [];
  }

  // Add a new member to the project
  async addProjectMember(
    projectId: string,
    addMemberDto: AddMemberDto,
    userId: string,
    accessToken: string
  ): Promise<ProjectMember> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verify the user is the project owner
    await this.verifyProjectOwnership(projectId, userId, accessToken);

    // First, find the user by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, username, email, avatar_url")
      .eq("email", addMemberDto.email)
      .single();

    if (profileError || !profile) {
      throw new NotFoundException(
        `User with email ${addMemberDto.email} not found`
      );
    }

    // Check if user is already a member
    const { data: existingMember, error: checkError } = await supabase
      .from("projects_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", profile.id)
      .single();

    if (existingMember) {
      throw new BadRequestException("User is already a member of this project");
    }

    // Add the member
    const { data, error } = await supabase
      .from("projects_members")
      .insert({
        project_id: projectId,
        user_id: profile.id,
      })
      .select(
        `
        id,
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
      profiles: profile,
    };
  }

  // Remove a member from the project
  async removeProjectMember(
    projectId: string,
    memberId: string,
    userId: string,
    accessToken: string
  ): Promise<DeleteResponse> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verify the user is the project owner
    await this.verifyProjectOwnership(projectId, userId, accessToken);

    // Check if the member exists and get their details
    const { data: member, error: memberError } = await supabase
      .from("projects_members")
      .select("user_id")
      .eq("id", memberId)
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
      .eq("id", memberId)
      .eq("project_id", projectId);

    if (error) {
      throw new BadRequestException(
        `Failed to remove member: ${error.message}`
      );
    }

    return { message: "Member removed successfully" };
  }

  // Delete the entire project
  async deleteProject(
    projectId: string,
    userId: string,
    accessToken: string
  ): Promise<DeleteResponse> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verify the user is the project owner
    await this.verifyProjectOwnership(projectId, userId, accessToken);

    // First delete all project members
    await supabase
      .from("projects_members")
      .delete()
      .eq("project_id", projectId);

    // Then delete the project
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("author_id", userId);

    if (error) {
      throw new BadRequestException(
        `Failed to delete project: ${error.message}`
      );
    }

    return { message: "Project permanently deleted" };
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
  private async verifyProjectAccess(
    projectId: string,
    userId: string,
    accessToken: string
  ): Promise<void> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Check if user is the owner
    const { data: project } = await supabase
      .from("projects")
      .select("author_id")
      .eq("id", projectId)
      .single();

    if (project?.author_id === userId) {
      return; // User is the owner
    }

    // Check if user is a member
    const { data: member } = await supabase
      .from("projects_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single();

    if (!member) {
      throw new ForbiddenException("Access denied to this project");
    }
  }
}
