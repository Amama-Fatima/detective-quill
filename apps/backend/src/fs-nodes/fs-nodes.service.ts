// todo: try to make util functions (like setting the timeout etc and move them to a utils file maybe, i dunno)
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { ProjectsService } from "../projects/projects.service";
import { QueueService } from "src/queue/queue.service";
import {
  FsNodeTreeResponse,
  DeleteResponse,
  type FsNode,
  UpdateFileContentDto,
  UpdateNodeMetadataDto,
} from "@detective-quill/shared-types";
import {
  CreateFsNodeDto,
  UpdateFsNodeDto,
} from "./validation/fs-nodes.validation";

@Injectable()
export class FsNodesService {
  private sceneTimeouts = new Map<string, NodeJS.Timeout>();
  constructor(
    private supabaseService: SupabaseService,
    private projectsService: ProjectsService,
    private queueService: QueueService,
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

    // If parent_id is provided, verify it exists and belongs to the same project
    if (createNodeDto.parent_id) {
      const { data: parent, error: parentError } = await supabase
        .from("fs_nodes")
        .select("project_id, node_type")
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

      if (parent.node_type !== "folder") {
        throw new BadRequestException("Parent must be a folder");
      }
    }

    // Generate sort_order if not provided
    if (createNodeDto.sort_order === undefined) {
      const { data: siblings } = await supabase
        .from("fs_nodes")
        .select("sort_order")
        .eq("project_id", createNodeDto.project_id)
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
  }> {
    // Fetch all data in parallel
    const [project, nodes, currentNode] = await Promise.all([
      this.projectsService.findProjectById(projectId, userId),
      this.getProjectTree(projectId, userId),
      nodeId
        ? this.getNode(nodeId, userId).catch(() => null)
        : Promise.resolve(null),
    ]);

    return {
      project,
      nodes,
      currentNode,
    };
  }

  // ✅ Use the project_file_tree view instead of manual tree building
  async getProjectTree(
    projectId: string,
    userId: string,
  ): Promise<FsNodeTreeResponse[]> {
    const supabase = this.supabaseService.client;

    // Verify project ownership
    await this.projectsService.findProjectById(projectId, userId);

    // ✅ Using the project_file_tree view
    const { data: nodes, error } = await supabase
      .from("project_file_tree")
      .select("*")
      .eq("project_id", projectId)
      .order("depth", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch project tree: ${error.message}`,
      );
    }

    return this.buildTreeFromView(nodes || []);
  }

  // ✅ OPTIMIZED: Use get_node_children function for getting children
  async getNodeChildren(nodeId: string, userId: string): Promise<FsNode[]> {
    const supabase = this.supabaseService.client;

    // Verify node exists and user owns it
    await this.getNode(nodeId, userId);

    // ✅ Use the get_node_children stored function
    const { data: children, error } = await supabase.rpc("get_node_children", {
      node_uuid: nodeId,
    });

    if (error) {
      throw new Error(`Failed to fetch node children: ${error.message}`);
    }

    return children || [];
  }

  async getNode(nodeId: string, userId: string): Promise<FsNode> {
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

    const { data, error } = await supabase
      .from("fs_nodes")
      .update({
        content: updateContentDta.content,
        word_count: this.countWords(updateContentDta.content),
      })
      .eq("id", nodeId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to update file content: ${error.message}`,
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
          .select("project_id, node_type")
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

        if (parent.node_type !== "folder") {
          throw new BadRequestException("Parent must be a folder");
        }
      }
    }

    // Update metadata (triggers will handle path/depth/global_sequence)
    const { data, error } = await supabase
      .from("fs_nodes")
      .update(updateMetadataDto)
      .eq("id", nodeId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to update metadata: ${error.message}`,
      );
    }

    return data;
  }

  async deleteNode(nodeId: string, userId: string): Promise<DeleteResponse> {
    // todo: try to remove the use of delete response, shift to general api response
    const supabase = this.supabaseService.client;

    // Verify node exists and user owns it
    const node = await this.getNode(nodeId, userId);

    // If it's a folder, check for children and handle cascade
    if (node.node_type === "folder") {
      // Get all children recursively using the database function
      const { data: allChildren, error: childrenError } = await supabase.rpc(
        "get_node_children",
        { node_uuid: nodeId },
      );

      if (childrenError) {
        throw new Error(
          `Failed to check folder contents: ${childrenError.message}`,
        );
      }

      const children = allChildren || [];

      // If children exist, delete all children first (in reverse order to handle nested folders)
      if (children.length > 0) {
        // Sort by depth descending to delete deepest items first
        const sortedChildren = children.sort(
          (a, b) => (b.depth || 0) - (a.depth || 0),
        );

        for (const child of sortedChildren) {
          await supabase.from("fs_nodes").delete().eq("id", child.id);
        }
      }
    }

    // Delete the main node
    const { error } = await supabase.from("fs_nodes").delete().eq("id", nodeId);

    if (error) {
      throw new Error(`Failed to delete node: ${error.message}`);
    }

    return {
      message:
        node.node_type === "folder"
          ? "Folder and all contents permanently deleted"
          : "File permanently deleted",
    };
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
        parent_id: newParentId === null ? undefined : newParentId,
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

    // ✅ Using the project_file_tree view for efficient stats
    const { data: stats, error } = await supabase
      .from("project_file_tree")
      .select("node_type, total_word_count, parent_id")
      .eq("project_id", projectId);

    if (error) {
      throw new Error(`Failed to get project stats: ${error.message}`);
    }

    const totalFiles =
      stats?.filter((node) => node.node_type === "file").length || 0;
    const totalFolders =
      stats?.filter((node) => node.node_type === "folder").length || 0;
    const totalWordCount =
      stats?.reduce((sum, node) => {
        return (
          sum + (node.node_type === "file" ? node.total_word_count || 0 : 0)
        );
      }, 0) || 0;
    const rootNodes =
      stats?.filter((node) => node.parent_id === null).length || 0;

    return {
      totalFiles,
      totalFolders,
      totalWordCount,
      rootNodes,
    };
  }

  // ✅ simpler tree building using view data
  private buildTreeFromView(nodes: any[]): FsNodeTreeResponse[] {
    const nodeMap = new Map<string, FsNodeTreeResponse>();
    const rootNodes: FsNodeTreeResponse[] = [];

    // Create map of all nodes (they already have correct path/depth from view)
    nodes.forEach((node) => {
      nodeMap.set(node.id, {
        id: node.id,
        name: node.name,
        node_type: node.node_type,
        parent_id: node.parent_id,
        content: node.content,
        word_count: node.word_count,
        path: node.path, // ✅ Already calculated by DB
        sort_order: node.sort_order,
        created_at: node.created_at,
        updated_at: node.updated_at,
        children: [],
      });
    });

    // Build hierarchy (nodes are already sorted by depth and sort_order)
    nodes.forEach((node) => {
      const treeNode = nodeMap.get(node.id);
      if (!treeNode) return;

      if (node.parent_id) {
        const parent = nodeMap.get(node.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(treeNode);
        }
      } else {
        rootNodes.push(treeNode);
      }
    });

    return rootNodes;
  }

  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  private async handleSceneUpdate(
    nodeId: string,
    nodeData: FsNode,
    content: string,
    userId: string,
    supabase: any,
  ): Promise<void> {
    // Clear existing timeout if any
    const existingTimeout = this.sceneTimeouts.get(nodeId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set new timeout for 10 minutes
    const timeout = setTimeout(
      async () => {
        try {
          const parentInfo = await this.getParentInfo(nodeData, supabase);

          // Queue the embedding job with timeline info
          this.queueService.sendEmbeddingJob({
            fs_node_id: nodeId,
            content: content,
            project_id: nodeData.project_id,
            user_id: userId,
            scene_name: nodeData.name,
            chapter_name: parentInfo.chapter_name,
            chapter_sort_order: parentInfo.chapter_sort_order || 0,
            scene_sort_order: nodeData.sort_order || 1,
            global_sequence: nodeData.global_sequence || 1,
            timeline_path: nodeData.path,
          });

          // Remove from tracking
          this.sceneTimeouts.delete(nodeId);

          // console.log(
          //   `Queued embedding job for ${nodeData.path}: ${nodeData.name}`
          // );
        } catch (error) {
          console.error(`Failed to queue embedding job for ${nodeId}:`, error);
        }
      },
      10 * 60 * 1000,
    ); // 10 minutes = 600,000 ms

    // Store the timeout
    this.sceneTimeouts.set(nodeId, timeout);

    console.log(
      `⏰ Scene update tracked: ${nodeData.name} (embedding job in 10 min if no more updates)`,
    );
  }

  private async getParentInfo(
    nodeData: FsNode,
    supabase: any,
  ): Promise<{
    chapter_name?: string;
    chapter_sort_order?: number;
  }> {
    try {
      let chapterName: string | undefined;
      let chapterSortOrder: number | undefined;

      // Get chapter info if this scene has a parent folder
      if (nodeData.parent_id) {
        const { data: chapter } = await supabase
          .from("fs_nodes")
          .select("name, sort_order, node_type")
          .eq("id", nodeData.parent_id)
          .single();

        if (chapter?.node_type === "folder") {
          chapterName = chapter.name;
          chapterSortOrder = chapter.sort_order;
        }
      }

      return {
        chapter_name: chapterName,
        chapter_sort_order: chapterSortOrder,
      };
    } catch (error) {
      console.error("Error getting description path:", error);
      return {
        chapter_name: undefined,
        chapter_sort_order: undefined,
      };
    }
  }
}
