import { Injectable, NotFoundException } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateSnapshotDto } from "./dto/snapshots.dto";
import { FsNodesService } from "../fs-nodes/fs-nodes.service";

@Injectable()
export class SnapshotsService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly fsNodesService: FsNodesService,
  ) {}

  async createSnapshots(snapshots: CreateSnapshotDto[]) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("commit_snapshots")
      .insert(snapshots)
      .select("*");

    if (error) {
      throw new Error(`Failed to create snapshots: ${error.message}`);
    }

    return data;
  }

  async getSnapshotsByCommit(commitId: string) {
    const supabase = this.supabaseService.client;
    const { data, error } = await supabase
      .from("commit_snapshots")
      .select("*")
      .eq("commit_id", commitId);

    if (error || !data) {
      throw new NotFoundException(`Snapshots for commit ${commitId} not found`);
    }

    return data;
  }

  async deleteSnapshotsByCommit(commitId: string) {
    const supabase = this.supabaseService.client;
    const { error } = await supabase
      .from("commit_snapshots")
      .delete()
      .eq("commit_id", commitId);

    if (error) {
      throw new Error(`Failed to delete snapshots: ${error.message}`);
    }

    return { success: true };
  }

  async deleteSnapshotsByCommitIds(commitIds: string[]) {
    if (commitIds.length === 0) {
      return { success: true, deletedCommitIds: 0 };
    }

    const supabase = this.supabaseService.client;
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
  ) {
    const snapshots = await this.getSnapshotsByCommit(commitId);
    return await this.fsNodesService.replaceProjectNodesFromSnapshots(
      projectId,
      snapshots,
    );
  }

  // Helper method to create snapshots from fs_nodes
  async createSnapshotsFromNodes(commitId: string, projectId: string) {
    const nodes = await this.fsNodesService.getProjectNodes(projectId);

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
    }));

    return await this.createSnapshots(snapshots);
  }
}
