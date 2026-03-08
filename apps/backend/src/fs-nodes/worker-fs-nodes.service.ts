import { Injectable } from "@nestjs/common";
import { AdminSupabaseService } from "../supabase/admin-supabase.service";
import { NotFoundException } from "@nestjs/common";
import {
  CommitSnapshot,
  Database,
  type FsNode,
} from "@detective-quill/shared-types";

@Injectable()
export class WorkerFsNodesService {
  constructor(private adminSupabaseService: AdminSupabaseService) {}

  private async getActiveBranchId(projectId: string): Promise<string> {
    const supabase = this.adminSupabaseService.client;

    const { data, error } = await supabase
      .from("branches")
      .select("id")
      .eq("project_id", projectId)
      .eq("is_active", true)
      .single();

    if (error || !data?.id) {
      throw new NotFoundException(
        `Active branch for project ${projectId} not found`,
      );
    }

    return data.id;
  }

  async getProjectNodes(
    projectId: string,
    branchId?: string,
  ): Promise<FsNode[]> {
    const supabase = this.adminSupabaseService.client;
    const resolvedBranchId =
      branchId ?? (await this.getActiveBranchId(projectId));
    const { data: nodes, error } = await supabase
      .from("fs_nodes")
      .select("*")
      .eq("project_id", projectId)
      .eq("branch_id", resolvedBranchId);

    if (error) {
      throw new Error(`Failed to fetch project files: ${error.message}`);
    }

    return nodes || [];
  }

  async replaceProjectNodesFromSnapshots(
    projectId: string,
    snapshots: CommitSnapshot[],
    branchId?: string,
  ) {
    const supabase = this.adminSupabaseService.client;
    const resolvedBranchId =
      branchId ?? (await this.getActiveBranchId(projectId));

    const snapshotsForProject = snapshots.filter(
      (snapshot) => snapshot.project_id === projectId,
    );

    const currentNodes = await this.getProjectNodes(
      projectId,
      resolvedBranchId,
    );

    const nodesToRestore = snapshotsForProject
      .filter(
        (
          snapshot,
        ): snapshot is CommitSnapshot & {
          fs_node_id: string;
          node_type: Database["public"]["Enums"]["node_type"];
          path: string;
        } => !!snapshot.fs_node_id && !!snapshot.node_type && !!snapshot.path,
      )
      .slice()
      .sort((left, right) => (left.depth ?? 0) - (right.depth ?? 0))
      .map((snapshot) => ({
        id: snapshot.fs_node_id,
        project_id: projectId,
        branch_id: resolvedBranchId,
        name: snapshot.name,
        node_type: snapshot.node_type,
        parent_id: snapshot.parent_id,
        path: snapshot.path,
        content: snapshot.content,
        word_count: snapshot.word_count ?? 0,
        file_extension: snapshot.file_extension ?? "",
        sort_order: snapshot.sort_order,
        depth: snapshot.depth,
        created_at: snapshot.original_created_at ?? undefined,
        updated_at: snapshot.original_updated_at ?? undefined,
      }));

    const targetNodeIds = new Set(nodesToRestore.map((node) => node.id));
    const nodesToHide = currentNodes
      .filter((node) => !targetNodeIds.has(node.id))
      .sort((left, right) => (right.depth ?? 0) - (left.depth ?? 0));

    for (const node of nodesToRestore) {
      const { error: upsertError } = await supabase
        .from("fs_nodes")
        .upsert(node, { onConflict: "id" });

      if (upsertError) {
        throw new Error(
          `Failed to restore working tree for project ${projectId}: ${upsertError.message}`,
        );
      }
    }

    if (nodesToHide.length > 0) {
      const nodesToHideIds = nodesToHide.map((node) => node.id);

      const { error: hideError } = await supabase
        .from("fs_nodes")
        .update({ branch_id: null })
        .eq("project_id", projectId)
        .eq("branch_id", resolvedBranchId)
        .in("id", nodesToHideIds);

      if (hideError) {
        throw new Error(
          `Failed to update workspace nodes for branch checkout: ${hideError.message}`,
        );
      }
    }

    return { success: true, restoredNodes: nodesToRestore.length };
  }
}
