import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateBranchDto, UpdateBranchDto } from "./dto/branches.dto";
import { ProjectsService } from "src/projects/projects.service";
import { SnapshotsService } from "src/snapshots/snapshots.service";

@Injectable()
export class BranchesService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly projectsService: ProjectsService,
    private readonly snapshotsService: SnapshotsService,
  ) {}

  async createBranch(createBranchDto: CreateBranchDto, projectId: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("branches")
      .insert({
        ...createBranchDto,
        project_id: projectId,
        head_commit_id: createBranchDto.parent_commit_id,
        parent_branch_id: createBranchDto.parent_branch_id ?? null,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create branch: ${error.message}`);
    }

    return data;
  }

  async getBranchById(branchId: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .eq("id", branchId)
      .single();

    if (error) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    return data;
  }

  async getBranchesByProject(projectId: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch branches: ${error.message}`);
    }

    return data;
  }

  async updateBranch(branchId: string, updateBranchDto: UpdateBranchDto) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("branches")
      .update(updateBranchDto)
      .eq("id", branchId)
      .select("*")
      .single();

    if (error) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    if (updateBranchDto.is_default === true) {
      const { data: defaultBranches, error: defaultBranchesError } =
        await supabase
          .from("branches")
          .select("id")
          .eq("project_id", data.project_id)
          .eq("is_default", true);

      if (defaultBranchesError) {
        throw new Error(
          `Failed to fetch default branches: ${defaultBranchesError.message}`,
        );
      }

      const remainingDefaultBranchIds = (defaultBranches ?? [])
        .map((branch) => branch.id)
        .filter((id) => id !== branchId);

      if (remainingDefaultBranchIds.length > 0) {
        const { error: unsetDefaultError } = await supabase
          .from("branches")
          .update({ is_default: false })
          .in("id", remainingDefaultBranchIds);

        if (unsetDefaultError) {
          throw new Error(
            `Failed to update other default branches: ${unsetDefaultError.message}`,
          );
        }
      }
    }

    return data;
  }

  async deleteBranch(branchId: string) {
    const supabase = this.supabaseService.client;

    // Prevent deleting default branch
    const branch = await this.getBranchById(branchId);
    if (branch.is_default) {
      throw new BadRequestException("Cannot delete the default branch");
    }

    const { data, error } = await supabase
      .from("branches")
      .delete()
      .eq("id", branchId)
      .select("*")
      .single();

    if (error) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    return data;
  }

  async getHeadCommitId(branchId: string): Promise<string | null> {
    const supabase = this.supabaseService.client;
    const { data: branch } = await supabase
      .from("branches")
      .select("head_commit_id")
      .eq("id", branchId)
      .single();

    return branch?.head_commit_id || null;
  }

  async getActiveBranchByProject(projectId: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      throw new NotFoundException(
        `Active branch for project ${projectId} not found`,
      );
    }

    return data;
  }

  async setActiveBranch(projectId: string, branchId: string) {
    const supabase = this.supabaseService.client;

    const { error: deactivateError } = await supabase
      .from("branches")
      .update({ is_active: false })
      .eq("project_id", projectId);

    if (deactivateError) {
      throw new Error(
        `Failed to deactivate existing active branch: ${deactivateError.message}`,
      );
    }

    const { data, error } = await supabase
      .from("branches")
      .update({ is_active: true })
      .eq("id", branchId)
      .eq("project_id", projectId)
      .select("*")
      .single();

    if (error || !data) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    return data;
  }

  async switchActiveBranch(
    projectId: string,
    branchId: string,
    userId: string,
  ) {
    await this.projectsService.verifyProjectOwnership(projectId, userId);

    const targetBranch = await this.getBranchById(branchId);

    if (targetBranch.project_id !== projectId) {
      throw new BadRequestException(
        `Branch ${branchId} does not belong to project ${projectId}`,
      );
    }

    if (targetBranch.head_commit_id) {
      await this.snapshotsService.restoreProjectNodesFromCommitSnapshot(
        targetBranch.head_commit_id,
        projectId,
        targetBranch.id,
      );
    }

    const activeBranch = await this.setActiveBranch(projectId, branchId);

    return {
      branch: activeBranch,
      headCommitId: targetBranch.head_commit_id,
    };
  }

  async getBranchesWithParent(projectId: string) {
    const supabase = this.supabaseService.client;

    const { data: branches, error: branchError } = await supabase
      .from("branches")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (branchError) {
      throw new Error(`Failed to fetch branches: ${branchError.message}`);
    }

    if (!branches || branches.length === 0) return [];

    const parentCommitIds = branches
      .map((b) => b.parent_commit_id)
      .filter(Boolean) as string[];

    if (parentCommitIds.length === 0) {
      return branches.map((b) => ({ ...b, parent_branch_id: null }));
    }

    const { data: commits, error: commitError } = await supabase
      .from("commits")
      .select("id, branch_id")
      .in("id", parentCommitIds);

    if (commitError) {
      throw new Error(`Failed to fetch parent commits: ${commitError.message}`);
    }

    const commitToBranch = new Map<string, string>();
    for (const commit of commits ?? []) {
      if (commit.branch_id) {
        commitToBranch.set(commit.id, commit.branch_id);
      }
    }

    return branches.map((b) => ({
      ...b,
      parent_branch_id: b.parent_commit_id
        ? (commitToBranch.get(b.parent_commit_id) ?? null)
        : null,
    }));
  }
}
