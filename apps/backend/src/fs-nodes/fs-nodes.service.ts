import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { ProjectsService } from "../projects/projects.service";
import {
  CreateFsNodeDto,
  UpdateFsNodeDto,
  FsNodeResponse,
  FsNodeTreeResponse,
  DeleteResponse,
} from "@detective-quill/shared-types";

@Injectable()
export class FsNodesService {
  constructor(
    private supabaseService: SupabaseService,
    private projectsService: ProjectsService
  ) {}

  async createNode(
    createNodeDto: CreateFsNodeDto,
    userId: string,
    accessToken: string
  ): Promise<FsNodeResponse> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verify project ownership
    await this.projectsService.findProjectById(
      createNodeDto.project_id,
      userId,
      accessToken
    );

    // If parent_id is provided, verify it exists and belongs to the same project
    if (createNodeDto.parent_id) {
      const { data: parent, error: parentError } = await supabase
        .from("fs_nodes")
        .select("project_id, node_type")
        .eq("id", createNodeDto.parent_id)
        .eq("is_deleted", false)
        .single();

      if (parentError || !parent) {
        throw new BadRequestException("Parent node not found. No id provided");
      }

      if (parent.project_id !== createNodeDto.project_id) {
        throw new BadRequestException(
          "Parent node belongs to different project"
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
        .eq("is_deleted", false)
        .order("sort_order", { ascending: false })
        .limit(1);

      createNodeDto.sort_order = (siblings?.[0]?.sort_order || 0) + 1;
    }

    // Set file extension if not provided and it's a file
    if (createNodeDto.node_type === "file" && !createNodeDto.file_extension) {
      createNodeDto.file_extension = "md";
    }

    // ✅ SIMPLIFIED: Let the DB trigger handle path, depth calculation and word count
    // The update_node_hierarchy() trigger will automatically set path and depth
    const { data, error } = await supabase
      .from("fs_nodes")
      .insert({
        ...createNodeDto,
        word_count: createNodeDto.content
          ? this.countWords(createNodeDto.content)
          : 0,
        // Don't set path and depth - let the trigger handle it
      })
      .select()
      .single();

    if (error) {
      // ✅ SIMPLIFIED: Circular reference check is handled by the prevent_circular_reference() trigger
      throw new BadRequestException(`Failed to create node: ${error.message}`);
    }

    return data;
  }

  // ✅ Use the project_file_tree view instead of manual tree building
  async getProjectTree(
    projectId: string,
    userId: string,
    accessToken: string
  ): Promise<FsNodeTreeResponse[]> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verify project ownership
    await this.projectsService.findProjectById(projectId, userId, accessToken);

    // ✅ Using the project_file_tree view
    const { data: nodes, error } = await supabase
      .from("project_file_tree")
      .select("*")
      .eq("project_id", projectId)
      .order("depth", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch project tree: ${error.message}`
      );
    }

    // ✅ SIMPLIFIED: Use the pre-calculated hierarchy from the view
    return this.buildTreeFromView(nodes || []);
  }

  // ✅ OPTIMIZED: Use get_node_children function for getting children
  async getNodeChildren(
    nodeId: string,
    userId: string,
    accessToken: string
  ): Promise<FsNodeResponse[]> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verify node exists and user owns it
    await this.getNode(nodeId, userId, accessToken);

    // ✅ Use the get_node_children stored function
    const { data: children, error } = await supabase.rpc("get_node_children", {
      node_uuid: nodeId,
    });

    if (error) {
      throw new BadRequestException(
        `Failed to fetch node children: ${error.message}`
      );
    }

    return children || [];
  }

  async getNode(
    nodeId: string,
    userId: string,
    accessToken: string
  ): Promise<FsNodeResponse> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    const { data: node, error } = await supabase
      .from("fs_nodes")
      .select(
        `
        *,
        projects!inner(author_id)
      `
      )
      .eq("id", nodeId)
      .eq("is_deleted", false)
      .eq("projects.author_id", userId)
      .single();

    if (error || !node) {
      throw new NotFoundException("Node not found");
    }

    return node;
  }

  async updateNode(
    nodeId: string,
    updateNodeDto: UpdateFsNodeDto,
    userId: string,
    accessToken: string
  ): Promise<FsNodeResponse> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verify node exists and user owns it
    const existingNode = await this.getNode(nodeId, userId, accessToken);

    // If moving to a different parent, verify the new parent
    if (
      updateNodeDto.parent_id !== undefined &&
      updateNodeDto.parent_id !== existingNode.parent_id
    ) {
      if (updateNodeDto.parent_id) {
        const { data: parent, error: parentError } = await supabase
          .from("fs_nodes")
          .select("project_id, node_type")
          .eq("id", updateNodeDto.parent_id)
          .eq("is_deleted", false)
          .single();

        if (parentError || !parent) {
          throw new BadRequestException("New parent node not found");
        }

        if (parent.project_id !== existingNode.project_id) {
          throw new BadRequestException(
            "Cannot move node to different project"
          );
        }

        if (parent.node_type !== "folder") {
          throw new BadRequestException("Parent must be a folder");
        }
      }
    }

    // Update word count if content changed
    const updates: any = { ...updateNodeDto };
    if (updateNodeDto.content !== undefined) {
      updates.word_count = this.countWords(updateNodeDto.content);
    }

    // ✅ SIMPLIFIED: Let the DB trigger handle path/depth updates when parent_id changes
    // The update_node_hierarchy() trigger will automatically recalculate path and depth
    const { data, error } = await supabase
      .from("fs_nodes")
      .update(updates)
      .eq("id", nodeId)
      .select()
      .single();

    if (error) {
      // ✅ SIMPLIFIED: Circular reference prevention is handled by the trigger
      throw new BadRequestException(`Failed to update node: ${error.message}`);
    }

    return data;
  }

  // ✅ ENHANCED: Cascade delete using get_node_children function
  async deleteNode(
    nodeId: string,
    userId: string,
    accessToken: string,
    hardDelete: boolean = false,
    cascadeDelete: boolean = false
  ): Promise<DeleteResponse> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verify node exists and user owns it
    const node = await this.getNode(nodeId, userId, accessToken);

    // If it's a folder and has children, handle accordingly
    if (node.node_type === "folder") {
      const children = await this.getNodeChildren(nodeId, userId, accessToken);

      if (children.length > 0 && !cascadeDelete) {
        throw new BadRequestException(
          `Folder contains ${children.length} items. Use cascadeDelete=true to delete all contents.`
        );
      }

      // If cascade delete, delete all children first
      if (cascadeDelete) {
        for (const child of children) {
          await this.deleteNode(
            child.id,
            userId,
            accessToken,
            hardDelete,
            true
          );
        }
      }
    }

    if (hardDelete) {
      const { error } = await supabase
        .from("fs_nodes")
        .delete()
        .eq("id", nodeId);

      if (error) {
        throw new BadRequestException(
          `Failed to delete node: ${error.message}`
        );
      }

      return { message: "Node permanently deleted" };
    } else {
      const { error } = await supabase
        .from("fs_nodes")
        .update({ is_deleted: true })
        .eq("id", nodeId);

      if (error) {
        throw new BadRequestException(
          `Failed to delete node: ${error.message}`
        );
      }

      return { message: "Node moved to trash" };
    }
  }

  async moveNode(
    nodeId: string,
    newParentId: string | null,
    newSortOrder: number,
    userId: string,
    accessToken: string
  ): Promise<FsNodeResponse> {
    // ✅ updateNode will handle path/depth recalculation via triggers
    return this.updateNode(
      nodeId,
      {
        parent_id: newParentId === null ? undefined : newParentId,
        sort_order: newSortOrder,
      },
      userId,
      accessToken
    );
  }

  // ✅ NEW: Get project statistics using the view
  async getProjectStats(
    projectId: string,
    userId: string,
    accessToken: string
  ): Promise<{
    totalFiles: number;
    totalFolders: number;
    totalWordCount: number;
    rootNodes: number;
  }> {
    const supabase = this.supabaseService.getClientWithAuth(accessToken);

    // Verify project ownership
    await this.projectsService.findProjectById(projectId, userId, accessToken);

    // ✅ Using the project_file_tree view for efficient stats
    const { data: stats, error } = await supabase
      .from("project_file_tree")
      .select("node_type, total_word_count, parent_id")
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
}
