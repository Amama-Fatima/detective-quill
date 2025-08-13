"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { useAuth } from "@/context/auth-context";
import { useFsNodes } from "@/hooks/use-fs-nodes";
import { cn } from "@/lib/utils";
import { FileTree } from "./file-tree/file-tree";
import {
  FsNodeTreeResponse,
  FsNodeResponse,
} from "@detective-quill/shared-types";
import { getProject } from "@/lib/backend-calls/projects";
import { getFsNode } from "@/lib/backend-calls/fs-nodes";
import { toast } from "sonner";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  projectId: string;
}

export function WorkspaceLayout({ children, projectId }: WorkspaceLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [focusMode, setFocusMode] = useState<"normal" | "app" | "browser">(
    "normal"
  );
  const [projectName, setProjectName] = useState<string>("");
  const [projectLoading, setProjectLoading] = useState(true);
  const [currentNode, setCurrentNode] = useState<FsNodeResponse | null>(null);
  const [nodeLoading, setNodeLoading] = useState(false);

  const {
    nodes,
    loading: nodesLoading,
    error,
    refetch,
    setNodes,
  } = useFsNodes({ projectId });
  const { session } = useAuth();
  const params = useParams();
  const nodeId = params.nodeId as string;

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (!session?.access_token || !projectId) return;

      try {
        const response = await getProject(projectId, session.access_token);
        if (response.success && response.data) {
          setProjectName(response.data.title);
        } else {
          toast.error("Failed to load project");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project");
      } finally {
        setProjectLoading(false);
      }
    };

    fetchProject();
  }, [projectId, session?.access_token]);

  // Fetch current node details when nodeId changes
  useEffect(() => {
    const fetchCurrentNode = async () => {
      if (!session?.access_token || !nodeId) {
        setCurrentNode(null);
        return;
      }

      setNodeLoading(true);
      try {
        const response = await getFsNode(nodeId, session.access_token);
        if (response.success && response.data) {
          setCurrentNode(response.data);
        } else {
          setCurrentNode(null);
        }
      } catch (error) {
        console.error("Error fetching current node:", error);
        setCurrentNode(null);
      } finally {
        setNodeLoading(false);
      }
    };

    fetchCurrentNode();
  }, [nodeId, session?.access_token]);

  const updateNodes = (updatedNodes: FsNodeTreeResponse[]) => {
    setNodes(updatedNodes);
  };

  // Handle focus mode changes from editor
  const handleFocusModeChange = (mode: "normal" | "app" | "browser") => {
    setFocusMode(mode);
  };

  // Hide sidebar in focus modes
  const showSidebar = sidebarOpen && focusMode === "normal";

  // Count files and folders
  const { filesCount, foldersCount } = React.useMemo(() => {
    const countNodes = (
      nodeList: FsNodeTreeResponse[]
    ): { files: number; folders: number } => {
      let files = 0;
      let folders = 0;

      nodeList.forEach((node) => {
        if (node.node_type === "file") {
          files++;
        } else {
          folders++;
        }

        if (node.children) {
          const childCounts = countNodes(node.children);
          files += childCounts.files;
          folders += childCounts.folders;
        }
      });

      return { files, folders };
    };

    const counts = countNodes(nodes);
    return { filesCount: counts.files, foldersCount: counts.folders };
  }, [nodes]);

  // Generate breadcrumb components from file path
  const generateBreadcrumbs = () => {
    if (!currentNode?.path) return null;

    // Remove leading slash and split the path
    const pathParts = currentNode.path.replace(/^\//, "").split("/");

    return (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span className="text-foreground font-medium">{projectName}</span>
        {pathParts.map((part, index) => (
          <React.Fragment key={index}>
            <span>/</span>
            <span
              className={cn(
                index === pathParts.length - 1
                  ? "text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground cursor-pointer"
              )}
            >
              {part}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (projectLoading || nodesLoading) {
    return (
      <div className="flex h-screen w-full bg-background">
        <div className="w-80 border-r bg-card/50 animate-pulse">
          <div className="p-4 border-b">
            <div className="h-4 bg-muted rounded w-32 mb-2" />
            <div className="h-3 bg-muted rounded w-24" />
          </div>
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-muted rounded" />
            ))}
          </div>
        </div>
        <div className="flex-1 animate-pulse">
          <div className="h-12 border-b bg-muted/20" />
          <div className="flex-1 bg-muted/10" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex h-screen w-full bg-background">
      {showSidebar && (
        <aside
          className={cn(
            "w-80 border-r bg-gradient-to-b from-card/50 to-card/30 flex flex-col shadow-sm transition-all duration-300"
          )}
        >
          <WorkspaceHeader
            projectName={projectName}
            filesCount={filesCount}
            foldersCount={foldersCount}
            onCreateFile={() => {
              // This will be handled by FileTree component
            }}
          />
          <FileTree
            nodes={nodes}
            onNodesChange={updateNodes}
            projectId={projectId}
            projectName={projectName}
            session={session}
            loading={nodesLoading}
          />
        </aside>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        {focusMode === "normal" && (
          <div className="flex items-center justify-between border-b px-4 py-2 bg-card/30">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-muted rounded-md transition-colors"
                title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                {sidebarOpen ? "←" : "→"}
              </button>

              {/* Enhanced Breadcrumbs with File Path */}
              {nodeLoading ? (
                <div className="h-4 bg-muted rounded w-48 animate-pulse" />
              ) : nodeId && currentNode ? (
                generateBreadcrumbs()
              ) : (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">
                    {projectName}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pass focus mode handler to children */}
        <div className="flex-1">
          {React.cloneElement(children as React.ReactElement, {
            onFocusModeChange: handleFocusModeChange,
          })}
        </div>
      </main>
    </div>
  );
}
