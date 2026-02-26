import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateCommitDto } from "./dto/commits.dto";
import { BranchesService } from "src/branches/branches.service";
import { SnapshotsService } from "src/snapshots/snapshots.service";
import { ContributionsService } from "src/contributions/contributions.service";

@Injectable()
export class CommitsService {
  private readonly logger = new Logger(CommitsService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly branchesService: BranchesService,
    private readonly snapshotsService: SnapshotsService,
    private readonly contributionsService: ContributionsService,
  ) {}

  async createCommit(
    createCommitDto: CreateCommitDto,
    projectId: string,
    userId: string,
  ) {
    const supabase = this.supabaseService.client;

    // let parentCommitId = createCommitDto.parent_commit_id;
    const headCommitId = await this.branchesService.getHeadCommitId(
      createCommitDto.branch_id,
    );
    const parentCommitId = headCommitId; // it cannot be undefined because even when we first create a project, we create an initial commit for the default branch

    const { data: commit, error: commitError } = await supabase
      .from("commits")
      .insert({
        project_id: projectId,
        branch_id: createCommitDto.branch_id,
        message: createCommitDto.message,
        created_by: userId,
        parent_commit_id: parentCommitId || null,
      })
      .select("*")
      .single();

    if (commitError) {
      throw new Error(`Failed to create commit: ${commitError.message}`);
    }

    await this.snapshotsService.createSnapshotsFromNodes(
      commit.id,
      projectId,
      createCommitDto.branch_id,
    );

    await this.branchesService.updateBranch(createCommitDto.branch_id, {
      head_commit_id: commit.id,
    });

    try {
      await this.contributionsService.logCommitContribution(userId, commit.id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown contribution error";
      this.logger.warn(
        `Failed to log commit contribution for commit ${commit.id}: ${message}`,
      );
    }

    return commit;
  }

  async getCommitById(commitId: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("commits")
      .select("*")
      .eq("id", commitId)
      .single();

    if (error) {
      throw new NotFoundException(`Commit with ID ${commitId} not found`);
    }

    return data;
  }

  async getCommitsByBranch(
    branchId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: any[]; total: number }> {
    const supabase = this.supabaseService.client;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { count, error: countError } = await supabase
      .from("commits")
      .select("*", { count: "exact", head: true })
      .eq("branch_id", branchId);

    if (countError) {
      throw new Error(`Failed to count commits: ${countError.message}`);
    }

    const { data, error } = await supabase
      .from("commits")
      .select("*")
      .eq("branch_id", branchId)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch commits: ${error.message}`);
    }

    return { data: data || [], total: count ?? 0 };
  }

  async getCommitsByProject(projectId: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("commits")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch commits: ${error.message}`);
    }

    return data;
  }

  private async getCommitForRevert(commitId: string, projectId: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("commits")
      .select("id, branch_id, parent_commit_id, project_id")
      .eq("id", commitId)
      .eq("project_id", projectId)
      .single();

    if (error || !data) {
      throw new NotFoundException(
        `Commit with ID ${commitId} not found for project ${projectId}`,
      );
    }

    return data;
  }

  private async deleteCommitsByIds(commitIds: string[]) {
    if (commitIds.length === 0) {
      return { success: true, deletedCommits: 0 };
    }

    const supabase = this.supabaseService.client;
    const { error } = await supabase
      .from("commits")
      .delete()
      .in("id", commitIds);

    if (error) {
      throw new Error(`Failed to delete commits: ${error.message}`);
    }

    return { success: true, deletedCommits: commitIds.length };
  }

  private async getDescendantCommitsUntilTarget(
    headCommitId: string,
    targetCommitId: string,
    projectId: string,
  ): Promise<string[]> {
    const commitsToDelete: string[] = [];
    let currentCommitId: string | null = headCommitId;

    while (currentCommitId && currentCommitId !== targetCommitId) {
      const currentCommit = await this.getCommitForRevert(
        currentCommitId,
        projectId,
      );

      commitsToDelete.push(currentCommit.id);
      currentCommitId = currentCommit.parent_commit_id;
    }

    if (currentCommitId !== targetCommitId) {
      throw new BadRequestException(
        "Cannot revert: target commit is not an ancestor of the current branch head",
      );
    }

    return commitsToDelete;
  }

  async revertToCommit(commitId: string, projectId: string) {
    const targetCommit = await this.getCommitForRevert(commitId, projectId);
    const headCommitId = await this.branchesService.getHeadCommitId(
      targetCommit.branch_id,
    );

    if (!headCommitId) {
      throw new NotFoundException(
        `Head commit not found for branch ${targetCommit.branch_id}`,
      );
    }

    if (headCommitId === commitId) {
      return {
        branchId: targetCommit.branch_id,
        headCommitId: commitId,
        deletedCommitsCount: 0,
        deletedSnapshotsCount: 0,
      };
    }

    const commitIdsToDelete = await this.getDescendantCommitsUntilTarget(
      headCommitId,
      commitId,
      projectId,
    );

    await this.snapshotsService.restoreProjectNodesFromCommitSnapshot(
      commitId,
      projectId,
      targetCommit.branch_id,
    );

    await this.branchesService.updateBranch(targetCommit.branch_id, {
      head_commit_id: commitId,
    });

    await this.snapshotsService.deleteSnapshotsByCommitIds(commitIdsToDelete);
    await this.deleteCommitsByIds(commitIdsToDelete);

    return {
      branchId: targetCommit.branch_id,
      headCommitId: commitId,
      deletedCommitsCount: commitIdsToDelete.length,
      deletedSnapshotsCount: commitIdsToDelete.length,
    };
  }

  // todo: implement restoreFromCommit
  // async restoreFromCommit(commitId: string, projectId: string) {
  //   const supabase = this.supabaseService.client;

  //   // 1. Get commit snapshots
  //   const { data: snapshots, error: snapshotsError } = await supabase
  //     .from("commit_snapshots")
  //     .select("*")
  //     .eq("commit_id", commitId);

  //   if (snapshotsError || !snapshots) {
  //     throw new NotFoundException(`Snapshots for commit ${commitId} not found`);
  //   }

  //   // 2. Delete current fs_nodes
  //   const { error: deleteError } = await supabase
  //     .from("fs_nodes")
  //     .delete()
  //     .eq("project_id", projectId);

  //   if (deleteError) {
  //     throw new Error(`Failed to delete current files: ${deleteError.message}`);
  //   }

  //   // 3. Restore from snapshot
  //   const nodesToRestore = snapshots.map((snap) => ({
  //     id: snap.node_id,
  //     project_id: projectId,
  //     name: snap.name,
  //     node_type: snap.node_type,
  //     parent_id: snap.parent_id,
  //     path: snap.path,
  //     content: snap.content,
  //     word_count: snap.word_count,
  //     file_extension: snap.file_extension,
  //     sort_order: snap.sort_order,
  //     created_at: snap.original_created_at,
  //     updated_at: snap.original_updated_at,
  //   }));

  //   const { error: insertError } = await supabase
  //     .from("fs_nodes")
  //     .insert(nodesToRestore);

  //   if (insertError) {
  //     throw new Error(`Failed to restore files: ${insertError.message}`);
  //   }

  //   return { success: true, restoredFiles: nodesToRestore.length };
  // }
}
