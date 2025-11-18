// lib/server/workspace-data.ts
import { createSupabaseServerClient } from "@/supabase/server-client";
import {
  FsNodeTreeResponse,
  FsNodeResponse,
  Project,
} from "@detective-quill/shared-types";
import { notFound, redirect } from "next/navigation";

async function getEditorWorkspaceData(
  projectId: string,
  nodeId?: string
): Promise<{
  project: Project;
  nodes: FsNodeTreeResponse[];
  currentNode: FsNodeResponse | null;
  user: any;
}> {
  // Get current user
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/sign-in");
  }

  try {
    // Fetch all data in parallel
    const [projectResult, nodesResult, nodeResult] = await Promise.allSettled([
      fetchProject(supabase, projectId, user.id),
      fetchProjectTree(supabase, projectId, user.id),
      nodeId ? fetchNode(supabase, nodeId, user.id) : Promise.resolve(null),
    ]);

    // Handle project result
    if (projectResult.status === "rejected") {
      console.error("Failed to fetch project:", projectResult.reason);
      notFound();
    }

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
      user,
    };
  } catch (error) {
    console.error("Error fetching workspace data:", error);
    throw error;
  }
}

async function fetchProject(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  projectId: string,
  userId: string
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("author_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Project not found");
  }

  return data;
}

async function fetchProjectTree(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  projectId: string,
  userId: string
): Promise<FsNodeTreeResponse[]> {
  // First verify project ownership
  await fetchProject(supabase, projectId, userId);

  // Fetch the project tree
  const { data: nodes, error } = await supabase
    .from("project_file_tree")
    .select("*")
    .eq("project_id", projectId)
    .order("depth", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch project tree: ${error.message}`);
  }

  return buildTreeFromView(nodes || []);
}

async function fetchNode(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  nodeId: string,
  userId: string
): Promise<FsNodeResponse> {
  const { data: node, error } = await supabase
    .from("fs_nodes")
    .select(
      `
      *,
      projects!inner(author_id)
    `
    )
    .eq("id", nodeId)
    .eq("projects.author_id", userId)
    .single();

  if (error || !node) {
    throw new Error("Node not found");
  }

  return node;
}

// todo: add type as FsNodeTreeResponse if that is accurate
function buildTreeFromView(nodes: any[]): FsNodeTreeResponse[] {
  const nodeMap = new Map<string, FsNodeTreeResponse>();
  const rootNodes: FsNodeTreeResponse[] = [];

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

async function fetchProjectTitle(
  projectId: string
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
