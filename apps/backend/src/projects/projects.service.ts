import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectResponse,
  ProjectStats,
  DeleteResponse,
} from "@detective-quill/shared-types";

@Injectable()
export class ProjectsService {
  constructor(private supabaseService: SupabaseService) {}

  async createProject(
    createProjectDto: CreateProjectDto,
    userId: string
  ): Promise<ProjectResponse> {
    const supabase = this.supabaseService.client;

    try {
      // Step 1: Create the project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: createProjectDto.title,
          description: createProjectDto.description || null,
          author_id: userId,
        })
        .select()
        .single();

      if (projectError) {
        throw new BadRequestException(
          `Failed to create project: ${projectError.message}`
        );
      }

      // Step 2: Add the creator as a project member
      const { error: memberError } = await supabase
        .from("projects_members")
        .insert({
          project_id: project.id,
          user_id: userId,
        });

      if (memberError) {
        // Cleanup: delete the project if member insertion fails
        await supabase.from("projects").delete().eq("id", project.id);

        throw new BadRequestException(
          `Failed to add project member: ${memberError.message}`
        );
      }

      return project;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create project: ${error.message}`
      );
    }
  }

  async findAllUserProjects(
    userId: string,
    includeInactive: boolean = false
  ): Promise<ProjectResponse[]> {
    const supabase = this.supabaseService.client;

    let query = supabase
      .from("projects")
      .select("*")
      .eq("author_id", userId)
      .order("updated_at", { ascending: false });

    if (!includeInactive) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(
        `Failed to fetch projects: ${error.message}`
      );
    }

    return data || [];
  }

  async findProjectById(
    projectId: string,
    userId: string
  ): Promise<ProjectResponse> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("author_id", userId)
      .single();

    if (error || !data) {
      throw new NotFoundException("Project not found. Dont know why");
    }

    return data;
  }

  // Update project information (title, description)
  async updateProjectInfo(
    projectId: string,
    updateData: UpdateProjectDto,
    userId: string
  ): Promise<ProjectResponse> {
    const supabase = this.supabaseService.client;

    // First verify the user is the project owner
    await this.verifyProjectOwnership(projectId, userId);

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

  async deleteProject(
    projectId: string,
    userId: string
  ): Promise<DeleteResponse> {
    const supabase = this.supabaseService.client;

    // Verify the user is the project owner
    await this.verifyProjectOwnership(projectId, userId);

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

  async restoreProject(
    projectId: string,
    userId: string
  ): Promise<ProjectResponse> {
    const supabase = this.supabaseService.client;

    // Check if project exists (including deleted ones)
    const { data: existingProject, error: findError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("author_id", userId)
      .single();

    if (findError || !existingProject) {
      throw new NotFoundException("Project not found");
    }

    if (!existingProject.is_deleted) {
      throw new BadRequestException("Project is not deleted");
    }

    const { data, error } = await supabase
      .from("projects")
      .update({
        is_deleted: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .eq("author_id", userId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to restore project: ${error.message}`
      );
    }

    return data;
  }

  async getDeletedProjects(userId: string): Promise<ProjectResponse[]> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("author_id", userId)
      .eq("is_deleted", true)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch deleted projects: ${error.message}`
      );
    }

    return data || [];
  }

  async getProjectStats(
    projectId: string,
    userId: string
  ): Promise<ProjectStats> {
    const supabase = this.supabaseService.client;

    // First verify project exists and belongs to user
    await this.findProjectById(projectId, userId);

    // Get file and folder counts
    const { data: stats, error } = await supabase
      .from("fs_nodes")
      .select("node_type, word_count, updated_at")
      .eq("project_id", projectId);

    if (error) {
      throw new BadRequestException(
        `Failed to get project stats: ${error.message}`
      );
    }

    const totalFiles =
      stats?.filter((node) => node.node_type === "file").length || 0;
    const totalFolders =
      stats?.filter((node) => node.node_type === "folder").length || 0;
    const totalWordCount =
      stats?.reduce((sum, node) => sum + (node.word_count || 0), 0) || 0;
    const lastModified =
      stats?.reduce((latest, node) => {
        return new Date(node.updated_at) > new Date(latest)
          ? node.updated_at
          : latest;
      }, stats[0]?.updated_at || new Date().toISOString()) ||
      new Date().toISOString();

    return {
      totalFiles,
      totalFolders,
      totalWordCount,
      lastModified,
    };
  }

  // Helper method to verify project ownership ( cannot make this private, need it in other places)
  async verifyProjectOwnership(
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
}
