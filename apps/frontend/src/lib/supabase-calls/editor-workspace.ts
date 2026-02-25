// lib/server/workspace-data.ts
import { createSupabaseServerClient } from "@/supabase/server-client";
import {
  buildTreeFromFlat,
  Database,
  FsNodeTreeResponse,
  FsNode,
  Project,
} from "@detective-quill/shared-types";
import { notFound } from "next/navigation";

async function getEditorWorkspaceData(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  projectId: string,
  nodeId?: string,
): Promise<{
  project: Project;
  nodes: FsNodeTreeResponse[];
  currentNode: FsNode | null;
  activeBranchId: string | null;
}> {
  try {
    const [projectResult, activeBranchResult] = await Promise.allSettled([
      fetchProject(supabase, projectId),
      fetchActiveBranchId(supabase, projectId),
    ]);

    // Handle project result
    if (projectResult.status === "rejected") {
      console.error("Failed to fetch project:", projectResult.reason);
      notFound();
    }

    const activeBranchId =
      activeBranchResult.status === "fulfilled"
        ? activeBranchResult.value
        : null;

    const [nodesResult, nodeResult] = await Promise.allSettled([
      fetchProjectTree(supabase, projectId, activeBranchId),
      nodeId && activeBranchId
        ? fetchNode(supabase, nodeId, projectId, activeBranchId)
        : Promise.resolve(null),
    ]);

    // Handle nodes result
    if (nodesResult.status === "rejected") {
      console.error("Failed to fetch project tree:", nodesResult.reason);
      throw new Error("Failed to load project files");
    }

    // Handle node result (optional)
    const currentNode =
      nodeResult.status === "fulfilled" ? nodeResult.value : null;
    return {
      project: projectResult.value,
      nodes: nodesResult.value,
      currentNode,
      activeBranchId,
    };
  } catch (error) {
    console.error("Error fetching workspace data:", error);
    throw error;
  }
}

async function fetchProject(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  projectId: string,
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (error || !data) {
    throw new Error("Project not found");
  }

  return data;
}

async function fetchProjectTree(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  projectId: string,
  branchId: string | null,
): Promise<FsNodeTreeResponse[]> {
  if (!branchId) {
    return [];
  }

  const { data: nodes, error } = await supabase
    .from("project_file_tree")
    .select("*")
    .eq("project_id", projectId)
    .eq("branch_id", branchId)
    .order("depth", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch project tree: ${error.message}`);
  }

  return buildTreeFromView(nodes || []);
}

async function fetchActiveBranchId(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  projectId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("branches")
    .select("id, is_active, project_id")
    .eq("project_id", projectId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    // If no active branch is found or there's an error, return null.
    return null;
  }

  return data.id;
}

async function fetchNode(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  nodeId: string,
  projectId: string,
  branchId: string,
): Promise<FsNode> {
  const { data: node, error } = await supabase
    .from("fs_nodes")
    .select(
      `
      *,
      projects!inner(author_id)
    `,
    )
    .eq("id", nodeId)
    .eq("project_id", projectId)
    .eq("branch_id", branchId)
    .single();

  if (error || !node) {
    throw new Error("Node not found");
  }

  return node;
}

type ProjectFileTreeRow =
  Database["public"]["Views"]["project_file_tree"]["Row"];

type WorkspaceTreeNode = FsNodeTreeResponse & {
  depth: number | null;
  children: WorkspaceTreeNode[];
};

function buildTreeFromView(nodes: ProjectFileTreeRow[]): FsNodeTreeResponse[] {
  const normalizedNodes: WorkspaceTreeNode[] = nodes
    .filter(
      (
        node,
      ): node is ProjectFileTreeRow & {
        id: string;
        name: string;
        node_type: "folder" | "file";
        path: string;
        created_at: string;
        updated_at: string;
      } =>
        !!node.id &&
        !!node.name &&
        !!node.node_type &&
        !!node.path &&
        !!node.created_at &&
        !!node.updated_at,
    )
    .map((node) => ({
      id: node.id,
      name: node.name,
      node_type: node.node_type,
      branch_id: node.branch_id,
      parent_id: node.parent_id,
      content: node.content ?? undefined,
      word_count: node.word_count ?? 0,
      path: node.path,
      sort_order: node.sort_order,
      depth: node.depth,
      created_at: node.created_at,
      updated_at: node.updated_at,
      children: [],
    }));

  const tree = buildTreeFromFlat(normalizedNodes, {
    getId: (node) => node.id,
    getParentId: (node) => node.parent_id,
    getDepth: (node) => node.depth,
    getSortOrder: (node) => node.sort_order,
    getTieBreaker: (node) => node.name,
  });

  const stripDepth = (treeNodes: WorkspaceTreeNode[]): FsNodeTreeResponse[] =>
    treeNodes.map(({ depth: _depth, ...node }) => ({
      ...node,
      children: stripDepth(node.children),
    }));

  return stripDepth(tree);
}

async function fetchProjectTitle(
  projectId: string,
): Promise<{ title: string; error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .select("title")
    .eq("id", projectId)
    .single();
  if (error || !data) {
    return { title: "", error: "Project not found" };
  }
  return { title: data.title, error: null };
}

export {
  getEditorWorkspaceData,
  fetchProject,
  fetchProjectTree,
  fetchNode,
  fetchProjectTitle,
};
