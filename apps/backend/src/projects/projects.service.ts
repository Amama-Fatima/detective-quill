import {
  Injectable,
  NotFoundException,
  BadRequestException,
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
    userId: string,
    accessToken: string
  ): Promise<ProjectResponse> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data, error } = await supabase
      .from("projects")
      .insert({
        title: createProjectDto.title,
        description: createProjectDto.description || null,
        author_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to create project: ${error.message}`
      );
    }

    return data;
  }

  async findAllUserProjects(
    userId: string,
    accessToken: string,
    includeInactive: boolean = false
  ): Promise<ProjectResponse[]> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

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
    userId: string,
    accessToken: string
  ): Promise<ProjectResponse> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

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

  async updateProject(
    projectId: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
    accessToken: string
  ): Promise<ProjectResponse> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // First check if project exists and belongs to user
    await this.findProjectById(projectId, userId, accessToken);

    const { data, error } = await supabase
      .from("projects")
      .update({
        ...updateProjectDto,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .eq("author_id", userId)
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
    userId: string,
    accessToken: string,
    hardDelete: boolean = false
  ): Promise<DeleteResponse> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // First check if project exists and belongs to user
    await this.findProjectById(projectId, userId, accessToken);

    if (hardDelete) {
      // Hard delete - completely remove from database
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
    } else {
      // Soft delete - mark as deleted
      const { error } = await supabase
        .from("projects")
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .eq("author_id", userId);

      if (error) {
        throw new BadRequestException(
          `Failed to delete project: ${error.message}`
        );
      }

      return { message: "Project moved to trash" };
    }
  }

  async restoreProject(
    projectId: string,
    userId: string,
    accessToken: string
  ): Promise<ProjectResponse> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

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

  async getDeletedProjects(
    userId: string,
    accessToken: string
  ): Promise<ProjectResponse[]> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

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
    userId: string,
    accessToken: string
  ): Promise<ProjectStats> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // First verify project exists and belongs to user
    await this.findProjectById(projectId, userId, accessToken);

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
}
