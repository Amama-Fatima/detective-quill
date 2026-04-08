import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { ProjectsService } from "../projects/projects.service";
import { ContributionsService } from "src/contributions/contributions.service";
import { BadgesNStatsService } from "src/badges_n_stats/badges_n_stats.service";
import type {
  Database,
  CommitSnapshot,
  FsNodeTreeResponse,
  FsNode,
  UpdateFileContentDto,
  UpdateNodeMetadataDto,
} from "@detective-quill/shared-types";
import {
  buildTreeFromFlat,
  mapProjectFileTreeRowsToTreeNodes,
  ProjectFileTreeRow,
} from "./tree-utils";

import { CreateFsNodeDto } from "./validation/fs-nodes.validation";

@Injectable()
export class FsNodesService {
  private readonly logger = new Logger(FsNodesService.name);

  constructor(
    private supabaseService: SupabaseService,
    private projectsService: ProjectsService,
    private contributionsService: ContributionsService,
    private badgesNStatsService: BadgesNStatsService,
  ) {}

  async createNode(
    createNodeDto: CreateFsNodeDto,
    userId: string,
  ): Promise<FsNode> {
    const supabase = this.supabaseService.client;

    // Verify project ownership
    await this.projectsService.verifyProjectOwnership(
      createNodeDto.project_id,
      userId,
    );

    const activeBranchId = await this.getActiveBranchId(
      createNodeDto.project_id,
    );

    // If parent_id is provided, verify it exists and belongs to the same project
    if (createNodeDto.parent_id) {
      const { data: parent, error: parentError } = await supabase
        .from("fs_nodes")
        .select("project_id, node_type, branch_id")
        .eq("id", createNodeDto.parent_id)
        .single();

      if (parentError || !parent) {
        throw new BadRequestException("Parent node not found. No id provided");
      }

      if (parent.project_id !== createNodeDto.project_id) {
        throw new BadRequestException(
          "Parent node belongs to different project",
        );
      }

      if (parent.branch_id !== activeBranchId) {
        throw new BadRequestException(
          "Parent node belongs to a different branch",
        );
      }

      if (parent.node_type !== "folder") {
        throw new BadRequestException("Parent must be a folder");
      }
    }

    // todo: i dont think this is needed, because i think sort order will exist
    // Generate sort_order if not provided
    if (createNodeDto.sort_order === undefined) {
      const { data: siblings } = await supabase
        .from("fs_nodes")
        .select("sort_order")
        .eq("project_id", createNodeDto.project_id)
        .eq("branch_id", activeBranchId)
        .eq("parent_id", createNodeDto.parent_id || null)
        .order("sort_order", { ascending: false })
        .limit(1);

      createNodeDto.sort_order = (siblings?.[0]?.sort_order || 0) + 1;
    }

    // Set file extension if not provided and it's a file
    if (createNodeDto.node_type === "file" && !createNodeDto.file_extension) {
      createNodeDto.file_extension = "md";
    }

    // The update_node_hierarchy() trigger will automatically set path and depth
    const { data, error } = await supabase
      .from("fs_nodes")
      .insert({
        ...createNodeDto,
        branch_id: activeBranchId,
        word_count: createNodeDto.content
          ? this.countWords(createNodeDto.content)
          : 0,
      })
      .select()
      .single();

    if (error) {
      // Circular reference check is handled by the prevent_circular_reference() trigger
      throw new BadRequestException(`Failed to create node: ${error.message}`);
    }

    try {
      await this.adjustBranchWordCount(
        activeBranchId,
        Number(data?.word_count ?? 0),
      );
    } catch (statsError) {
      const message =
        statsError instanceof Error
          ? statsError.message
          : "Unknown stats error";
      this.logger.warn(
        `Failed to update current_word_count for branch ${activeBranchId}: ${message}`,
      );
    }

    try {
      await this.badgesNStatsService.updateWordsWritten(
        userId,
        Number(data?.word_count ?? 0),
      );
      await this.badgesNStatsService.evaluateAndAward(userId);
    } catch (statsError) {
      const message =
        statsError instanceof Error
          ? statsError.message
          : "Unknown stats error";
      this.logger.warn(
        `Failed to update words_written for user ${userId}: ${message}`,
      );
    }

    return data;
  }

  async getEditorWorkspaceData(
    projectId: string,
    userId: string,
    nodeId?: string,
  ): Promise<{
    project: any;
    nodes: FsNodeTreeResponse[];
    currentNode: FsNode | null;
    activeBranchId: string | null;
  }> {
    const [project, activeBranchId] = await Promise.all([
      this.projectsService.findProjectById(projectId, userId),
      this.getActiveBranchId(projectId),
    ]);

    const [nodes, currentNode] = await Promise.all([
      this.getProjectTree(projectId, userId, activeBranchId),
      nodeId
        ? this.getNode(nodeId, userId, projectId, activeBranchId).catch(
            () => null,
          )
        : Promise.resolve(null),
    ]);

    return {
      project,
      nodes,
      currentNode,
      activeBranchId,
    };
  }

  // Use the project_file_tree view instead of manual tree building
  async getProjectTree(
    projectId: string,
    userId: string,
    branchId?: string,
  ): Promise<FsNodeTreeResponse[]> {
    const supabase = this.supabaseService.client;

    // Verify project ownership
    await this.projectsService.findProjectById(projectId, userId);
    const resolvedBranchId =
      branchId ?? (await this.getActiveBranchId(projectId));

    // Using the project_file_tree view
    const { data: nodes, error } = await supabase
      .from("project_file_tree")
      .select("*")
      .eq("project_id", projectId)
      .eq("branch_id", resolvedBranchId)
      .order("depth", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch project tree: ${error.message}`,
      );
    }

    return this.buildTreeFromView(nodes || []);
  }

  // OPTIMIZED: Use get_node_children function for getting children
  async getNodeChildren(nodeId: string, userId: string): Promise<FsNode[]> {
    const supabase = this.supabaseService.client;

    // Verify node exists and user owns it
    const node = await this.getNode(nodeId, userId);
    const activeBranchId = await this.getActiveBranchId(node.project_id);

    // Fetch direct children in the active branch only
    const { data: children, error } = await supabase
      .from("fs_nodes")
      .select("*")
      .eq("project_id", node.project_id)
      .eq("branch_id", activeBranchId)
      .eq("parent_id", nodeId)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch node children: ${error.message}`);
    }

    return children || [];
  }

  async getNode(
    nodeId: string,
    userId: string,
    projectId?: string,
    branchId?: string,
  ): Promise<FsNode> {
    const supabase = this.supabaseService.client;

    const { data: node, error } = await supabase
      .from("fs_nodes")
      .select(
        `
        *,
        projects!inner(author_id)
      `,
      )
      .eq("id", nodeId)
      .eq("projects.author_id", userId)
      .single();

    if (error || !node) {
      throw new NotFoundException("Node not found");
    }

    const scopedProjectId = projectId ?? node.project_id;
    if (node.project_id !== scopedProjectId) {
      throw new NotFoundException("Node not found");
    }

    const activeBranchId =
      branchId ?? (await this.getActiveBranchId(scopedProjectId));
    if (node.branch_id !== activeBranchId) {
      throw new ForbiddenException("Node does not belong to the active branch");
    }

    return node;
  }

  async updateFileContent(
    nodeId: string,
    updateContentDta: UpdateFileContentDto,
    userId: string,
  ): Promise<FsNode> {
    const supabase = this.supabaseService.client;

    const existingNode = await this.getNode(nodeId, userId);

    if (existingNode.node_type !== "file") {
      throw new BadRequestException("Only file nodes can have content updated");
    }

    const previousWordCount = Number(existingNode.word_count ?? 0);

    const { data, error } = await supabase
      .from("fs_nodes")
      .update({
        content: updateContentDta.content,
        word_count: this.countWords(updateContentDta.content),
      })
      .eq("id", nodeId)
      .eq("branch_id", existingNode.branch_id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to update file content: ${error.message}`,
      );
    }

    const nextWordCount = Number(data?.word_count ?? 0);
    const wordDelta = nextWordCount - previousWordCount;

    try {
      await this.adjustBranchWordCount(
        String(existingNode.branch_id),
        wordDelta,
      );
    } catch (statsError) {
      const message =
        statsError instanceof Error
          ? statsError.message
          : "Unknown stats error";
      this.logger.warn(
        `Failed to update current_word_count for branch ${existingNode.branch_id}: ${message}`,
      );
    }

    try {
      await this.badgesNStatsService.updateWordsWritten(userId, wordDelta);
      await this.badgesNStatsService.evaluateAndAward(userId);
    } catch (statsError) {
      const message =
        statsError instanceof Error
          ? statsError.message
          : "Unknown stats error";
      this.logger.warn(
        `Failed to update words_written for user ${userId}: ${message}`,
      );
    }

    try {
      await this.contributionsService.logSaveContribution(userId, nodeId);
    } catch (contributionError) {
      const message =
        contributionError instanceof Error
          ? contributionError.message
          : "Unknown contribution error";
      this.logger.warn(
        `Failed to log save contribution for node ${nodeId}: ${message}`,
      );
    }

    return data as FsNode;
  }

  async updateNodeMetadata(
    nodeId: string,
    updateMetadataDto: UpdateNodeMetadataDto,
    userId: string,
  ): Promise<FsNode> {
    const supabase = this.supabaseService.client;
    const existingNode = await this.getNode(nodeId, userId);

    if (
      updateMetadataDto.parent_id !== undefined &&
      updateMetadataDto.parent_id !== existingNode.parent_id
    ) {
      if (updateMetadataDto.parent_id) {
        const { data: parent, error: parentError } = await supabase
          .from("fs_nodes")
          .select("project_id, node_type, branch_id")
          .eq("id", updateMetadataDto.parent_id)
          .single();

        if (parentError || !parent) {
          throw new BadRequestException("New parent node not found");
        }

        if (parent.project_id !== existingNode.project_id) {
          throw new BadRequestException(
            "Cannot move node to different project",
          );
        }

        if (parent.branch_id !== existingNode.branch_id) {
          throw new BadRequestException("Cannot move node to different branch");
        }

        if (parent.node_type !== "folder") {
          throw new BadRequestException("Parent must be a folder");
        }
      }
    }
    const cleanUpdate = Object.fromEntries(
      Object.entries(updateMetadataDto).filter(([_, v]) => v !== undefined),
    );

    // If client explicitly wants to move to root
    if (
      "parent_id" in updateMetadataDto &&
      updateMetadataDto.parent_id === null
    ) {
      cleanUpdate.parent_id = null;
    }

    // Update metadata (triggers will handle path/depth/global_sequence)
    const { data, error } = await supabase
      .from("fs_nodes")
      .update(cleanUpdate)
      .eq("id", nodeId)
      .eq("branch_id", existingNode.branch_id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to update metadata: ${error.message}`,
      );
    }

    return data;
  }

  async deleteNode(nodeId: string, userId: string): Promise<void> {
    // todo: try to remove the use of delete response, shift to general api response
    const supabase = this.supabaseService.client;

    // Verify node exists and user owns it
    const node = await this.getNode(nodeId, userId);
    const activeBranchId = await this.getActiveBranchId(node.project_id);

    if (node.branch_id !== activeBranchId) {
      throw new ForbiddenException("Node does not belong to the active branch");
    }

    // If it's a folder, check for children and handle cascade
    let wordsRemoved = Number(node.word_count ?? 0);
    if (node.node_type === "folder") {
      // Fetch descendants within the active branch by path prefix
      const pathPrefix = `${node.path}/%`;
      const { data: allChildren, error: childrenError } = await supabase
        .from("fs_nodes")
        .select("id, depth, word_count")
        .eq("project_id", node.project_id)
        .eq("branch_id", activeBranchId)
        .like("path", pathPrefix);

      if (childrenError) {
        throw new Error(
          `Failed to check folder contents: ${childrenError.message}`,
        );
      }

      const children = allChildren || [];
      wordsRemoved += children.reduce(
        (sum, child) => sum + Number(child.word_count ?? 0),
        0,
      );

      // If children exist, delete all children first (in reverse order to handle nested folders)
      if (children.length > 0) {
        const childIds = children.map((child) => child.id);
        const { error: hideChildrenError } = await supabase
          .from("fs_nodes")
          .update({ branch_id: null })
          .eq("project_id", node.project_id)
          .eq("branch_id", activeBranchId)
          .in("id", childIds);

        if (hideChildrenError) {
          throw new Error(
            `Failed to remove folder contents: ${hideChildrenError.message}`,
          );
        }
      }
    }

    try {
      await this.adjustBranchWordCount(activeBranchId, -wordsRemoved);
    } catch (statsError) {
      const message =
        statsError instanceof Error
          ? statsError.message
          : "Unknown stats error";
      this.logger.warn(
        `Failed to update current_word_count for branch ${activeBranchId}: ${message}`,
      );
    }

    try {
      await this.badgesNStatsService.updateWordsWritten(userId, -wordsRemoved);
      await this.badgesNStatsService.evaluateAndAward(userId); // ← NEW
    } catch (statsError) {
      const message =
        statsError instanceof Error
          ? statsError.message
          : "Unknown stats error";
      this.logger.warn(
        `Failed to update words_written for user ${userId}: ${message}`,
      );
    }

    // Hide the main node from the active branch workspace
    const { error } = await supabase
      .from("fs_nodes")
      .update({ branch_id: null })
      .eq("id", nodeId)
      .eq("project_id", node.project_id)
      .eq("branch_id", activeBranchId);

    if (error) {
      throw new Error(`Failed to delete node: ${error.message}`);
    }

    return;
  }

  async moveNode(
    nodeId: string,
    newParentId: string | null,
    newSortOrder: number,
    userId: string,
  ): Promise<FsNode> {
    return this.updateNodeMetadata(
      nodeId,
      {
        parent_id: newParentId === null ? null : newParentId,
        sort_order: newSortOrder,
      },
      userId,
    );
  }

  async getProjectStats(
    projectId: string,
    userId: string,
  ): Promise<{
    totalFiles: number;
    totalFolders: number;
    totalWordCount: number;
    rootNodes: number;
  }> {
    const supabase = this.supabaseService.client;

    // Verify project ownership
    await this.projectsService.findProjectById(projectId, userId);
    const activeBranchId = await this.getActiveBranchId(projectId);

    // Using the project_file_tree view for efficient stats
    const [{ data: stats, error }, { data: branch, error: branchError }] =
      await Promise.all([
        supabase
          .from("project_file_tree")
          .select("node_type, parent_id")
          .eq("project_id", projectId)
          .eq("branch_id", activeBranchId),
        supabase
          .from("branches")
          .select("current_word_count")
          .eq("id", activeBranchId)
          .single(),
      ]);

    if (error) {
      throw new Error(`Failed to get project stats: ${error.message}`);
    }

    if (branchError) {
      throw new Error(
        `Failed to get branch word count: ${branchError.message}`,
      );
    }

    const totalFiles =
      stats?.filter((node) => node.node_type === "file").length || 0;
    const totalFolders =
      stats?.filter((node) => node.node_type === "folder").length || 0;
    const totalWordCount = Number(branch?.current_word_count ?? 0);
    const rootNodes =
      stats?.filter((node) => node.parent_id === null).length || 0;

    return {
      totalFiles,
      totalFolders,
      totalWordCount,
      rootNodes,
    };
  }

  async getProjectNodes(
    projectId: string,
    branchId?: string,
  ): Promise<FsNode[]> {
    const supabase = this.supabaseService.client;
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
    const supabase = this.supabaseService.client;
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

  // simpler tree building using view data
  private buildTreeFromView(nodes: ProjectFileTreeRow[]): FsNodeTreeResponse[] {
    const normalizedNodes = mapProjectFileTreeRowsToTreeNodes(nodes);

    return buildTreeFromFlat(normalizedNodes, {
      getId: (node) => node.id,
      getParentId: (node) => node.parent_id,
      getDepth: (node) => node.depth,
      getSortOrder: (node) => node.sort_order,
      getTieBreaker: (node) => node.name,
    });
  }

  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  private async adjustBranchWordCount(branchId: string, delta: number) {
    if (delta === 0) {
      return;
    }

    const supabase = this.supabaseService.client;

    const { data: currentBranch, error: branchError } = await supabase
      .from("branches")
      .select("current_word_count")
      .eq("id", branchId)
      .single();

    if (branchError) {
      throw new Error(`Failed to fetch branch stats: ${branchError.message}`);
    }

    const nextCurrentWordCount = Math.max(
      0,
      Number(currentBranch?.current_word_count ?? 0) + delta,
    );

    const { error: updateError } = await supabase
      .from("branches")
      .update({ current_word_count: nextCurrentWordCount })
      .eq("id", branchId);

    if (updateError) {
      throw new Error(
        `Failed to update branch word count: ${updateError.message}`,
      );
    }
  }

  private async getActiveBranchId(projectId: string): Promise<string> {
    const supabase = this.supabaseService.client;

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
}
