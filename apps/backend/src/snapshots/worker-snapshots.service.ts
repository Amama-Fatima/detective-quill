import { Injectable } from "@nestjs/common";
import { AdminSupabaseService } from "../supabase/admin-supabase.service";
import { CreateSnapshotDto } from "./dto/snapshots.dto";
import { createHash } from "crypto";
import { NotFoundException } from "@nestjs/common";
import { WorkerFsNodesService } from "src/fs-nodes/worker-fs-nodes.service";

@Injectable()
export class WorkerSnapshotsService {
  constructor(
    private adminSupabaseService: AdminSupabaseService,
    private workerFsNodesService: WorkerFsNodesService,
  ) {}

  async createSnapshots(snapshots: CreateSnapshotDto[]) {
    const supabase = this.adminSupabaseService.client;
    const { data, error } = await supabase
      .from("commit_snapshots")
      .insert(snapshots)
      .select("*");

    if (error) {
      throw new Error(`Failed to create snapshots: ${error.message}`);
    }

    return data;
  }

  private async getCommitBranchId(commitId: string): Promise<string> {
    const supabase = this.adminSupabaseService.client;
    const { data, error } = await supabase
      .from("commits")
      .select("branch_id")
      .eq("id", commitId)
      .single();

    if (error || !data?.branch_id) {
      throw new NotFoundException(`Branch not found for commit ${commitId}`);
    }

    return data.branch_id;
  }

  async getSnapshotsByCommit(commitId: string) {
    const supabase = this.adminSupabaseService.client;
    const { data, error } = await supabase
      .from("commit_snapshots")
      .select("*")
      .eq("commit_id", commitId);

    if (error || !data) {
      throw new NotFoundException(`Snapshots for commit ${commitId} not found`);
    }

    return data;
  }

  async createSnapshotsFromNodes(
    commitId: string,
    projectId: string,
    branchId?: string,
  ) {
    const resolvedBranchId =
      branchId ?? (await this.getCommitBranchId(commitId));
    const nodes = await this.workerFsNodesService.getProjectNodes(
      projectId,
      resolvedBranchId,
    );

    // Map nodes to snapshot DTOs
    const snapshots: CreateSnapshotDto[] = nodes.map((node) => ({
      commit_id: commitId,
      fs_node_id: node.id,
      name: node.name,
      node_type: node.node_type,
      parent_id: node.parent_id,
      path: node.path,
      content: node.content,
      word_count: node.word_count,
      file_extension: node.file_extension,
      sort_order: node.sort_order,
      original_created_at: node.created_at,
      original_updated_at: node.updated_at,
      depth: node.depth!,
      project_id: projectId,
      content_hash: createHash("sha256")
        .update(node.content ?? "")
        .digest("hex"),
    }));

    return await this.createSnapshots(snapshots);
  }

  async getChangedFiles(commitId: string, parentCommitId: string | null) {
    const supabase = this.adminSupabaseService.client;

    // Get current commit's snapshots
    const { data: current } = await supabase
      .from("commit_snapshots")
      .select("fs_node_id, content_hash, node_type, path")
      .eq("commit_id", commitId);

    if (!current) {
      throw new NotFoundException(`Snapshots for commit ${commitId} not found`);
    }

    // If no parent (initial commit), everything is "added"
    if (!parentCommitId) {
      return {
        added: current.filter((n) => n.node_type === "file"),
        modified: [],
        deleted: [],
      };
    }

    // Get parent commit's snapshots
    const { data: parent } = await supabase
      .from("commit_snapshots")
      .select("fs_node_id, content_hash, node_type, path")
      .eq("commit_id", parentCommitId);

    if (!parent) {
      throw new NotFoundException(
        `Snapshots for parent commit ${parentCommitId} not found`,
      );
    }

    const parentMap = new Map(parent.map((n) => [n.fs_node_id, n]));
    const currentMap = new Map(current.map((n) => [n.fs_node_id, n]));

    const added: typeof current = [];
    const modified: typeof current = [];
    const deleted: typeof current = [];

    for (const node of current) {
      if (node.node_type !== "file") continue; // skip folders
      const parentNode = parentMap.get(node.fs_node_id);
      if (!parentNode) {
        added.push(node);
      } else if (parentNode.content_hash !== node.content_hash) {
        modified.push(node);
      }
    }

    for (const node of parent) {
      if (node.node_type !== "file") continue;
      if (!currentMap.has(node.fs_node_id)) {
        deleted.push(node); // deleted files won't need processing
      }
    }

    return { added, modified, deleted };
  }

  async deleteSnapshotsByCommitIds(commitIds: string[]) {
    if (commitIds.length === 0) {
      return { success: true, deletedCommitIds: 0 };
    }

    const supabase = this.adminSupabaseService.client;
    const { error } = await supabase
      .from("commit_snapshots")
      .delete()
      .in("commit_id", commitIds);

    if (error) {
      throw new Error(`Failed to delete snapshots: ${error.message}`);
    }

    return { success: true, deletedCommitIds: commitIds.length };
  }

  async restoreProjectNodesFromCommitSnapshot(
    commitId: string,
    projectId: string,
    branchId?: string,
  ) {
    const snapshots = await this.getSnapshotsByCommit(commitId);
    const resolvedBranchId =
      branchId ?? (await this.getCommitBranchId(commitId));
    return await this.workerFsNodesService.replaceProjectNodesFromSnapshots(
      projectId,
      snapshots,
      resolvedBranchId,
    );
  }
}
