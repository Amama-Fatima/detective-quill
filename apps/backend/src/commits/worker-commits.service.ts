import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { AdminSupabaseService } from "../supabase/admin-supabase.service";
import { CreateCommitDto } from "./dto/commits.dto";
import { WorkerBranchesService } from "src/branches/worker-branches.service";
import { WorkerSnapshotsService } from "src/snapshots/worker-snapshots.service";
import { WorkerContributionsService } from "src/contributions/worker-contributions.service";
import { CommitKnowledgeGraphService } from "src/commit-knowledge-graph/commit-knowledge-graph.service";

@Injectable()
export class WorkerCommitsService {
  constructor(
    private adminSupabaseService: AdminSupabaseService,
    private workerBranchesService: WorkerBranchesService,
    private workerSnapshotsService: WorkerSnapshotsService,
    private workerContributionsService: WorkerContributionsService,
    private readonly commitKnowledgeGraphService: CommitKnowledgeGraphService,
  ) {}

  async createCommit(
    createCommitDto: CreateCommitDto,
    projectId: string,
    userId: string,
  ) {
    const supabase = this.adminSupabaseService.client;

    // let parentCommitId = createCommitDto.parent_commit_id;
    const headCommitId = await this.workerBranchesService.getHeadCommitId(
      createCommitDto.branch_id,
    );
    const parentCommitId = headCommitId; // it cannot be undefined because even when we first create a project, we create an initial commit for the default branch

    const { data: commit, error: commitError } = await supabase
      .from("commits")
      .insert({
        project_id: projectId,
        branch_id: createCommitDto.branch_id,
        message: createCommitDto.message,
        // created_by: userId,
        parent_commit_id: parentCommitId || null,
      })
      .select("*")
      .single();

    if (commitError) {
      throw new Error(`Failed to create commit: ${commitError.message}`);
    }

    await this.workerSnapshotsService.createSnapshotsFromNodes(
      commit.id,
      projectId,
      createCommitDto.branch_id,
    );

    await this.workerBranchesService.updateBranch(createCommitDto.branch_id, {
      head_commit_id: commit.id,
    });

    const changed = await this.workerSnapshotsService.getChangedFiles(
      commit.id,
      parentCommitId ?? null,
    );

    try {
      await this.workerContributionsService.logCommitContribution(
        userId,
        commit.id,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown contribution error";
      console.error(
        `Failed to log contribution for commit ${commit.id}: ${message}`,
      );
    }

    try {
      const { enqueued } =
        await this.commitKnowledgeGraphService.enqueueCommitKnowledgeGraphJobs(
          commit.id,
          projectId,
          userId,
        );
      if (enqueued > 0) {
        this.logger.log(
          `Commit ${commit.id}: enqueued ${enqueued} knowledge graph job(s)`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.warn(
        `Failed to enqueue commit knowledge graph jobs for commit ${commit.id}: ${message}`,
      );
    }

    try {
      const { enqueued } =
        await this.commitKnowledgeGraphService.enqueueCommitKnowledgeGraphJobs(
          commit.id,
          projectId,
          userId,
        );
      if (enqueued > 0) {
        this.logger.log(
          `Commit ${commit.id}: enqueued ${enqueued} knowledge graph job(s)`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.warn(
        `Failed to enqueue commit knowledge graph jobs for commit ${commit.id}: ${message}`,
      );
    }

    console.log("commit created");
    const added = changed.added.map((n) => n.fs_node_id);
    const modified = changed.modified.map((n) => n.fs_node_id);
    const deleted = changed.deleted.map((n) => n.fs_node_id);
    console.log(
      `Changed files for commit ${commit.id} - Added: ${added.length}, Modified: ${modified.length}, Deleted: ${deleted.length}`,
    );

    return {
      commit,
      changedFiles: {
        added: added,
        modified: modified,
        deleted: deleted,
      },
    };
  }

  private async getCommitForRevert(commitId: string, projectId: string) {
    const supabase = this.adminSupabaseService.client;
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

    const supabase = this.adminSupabaseService.client;
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
    const headCommitId = await this.workerBranchesService.getHeadCommitId(
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

    await this.workerSnapshotsService.restoreProjectNodesFromCommitSnapshot(
      commitId,
      projectId,
      targetCommit.branch_id,
    );

    await this.workerBranchesService.updateBranch(targetCommit.branch_id, {
      head_commit_id: commitId,
    });

    await this.workerSnapshotsService.deleteSnapshotsByCommitIds(
      commitIdsToDelete,
    );
    await this.deleteCommitsByIds(commitIdsToDelete);

    return {
      branchId: targetCommit.branch_id,
      headCommitId: commitId,
      deletedCommitsCount: commitIdsToDelete.length,
      deletedSnapshotsCount: commitIdsToDelete.length,
    };
  }
}
