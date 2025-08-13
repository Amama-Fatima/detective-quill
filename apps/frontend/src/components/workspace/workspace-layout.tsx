"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { useAuth } from "@/context/auth-context";
import { useFsNodes } from "@/hooks/use-fs-nodes";
import { cn } from "@/lib/utils";
import { FileTree } from "./file-tree/file-tree";
import { FsNodeTreeResponse } from "@detective-quill/shared-types";
import { getProject } from "@/lib/backend-calls/projects";
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

  const {
    nodes,
    loading: nodesLoading,
    error,
    refetch,
    setNodes,
  } = useFsNodes({ projectId });
  const { session } = useAuth();
  const params = useParams();

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (!session?.access_token) {
        console.log("No session found, skipping project fetch");
      }
      if (!projectId) {
        console.log("projectId not found");
      }
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

  if (projectLoading || nodesLoading) {
    return <div>Loading... in workspace</div>;
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

              {/* Enhanced Breadcrumbs */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>{projectName}</span>
                {params.nodeId && (
                  <>
                    <span>/</span>
                    <span className="text-foreground font-medium">
                      {/* This will show the file path - you can enhance this to show full path */}
                      {params.nodeId}
                    </span>
                  </>
                )}
              </div>
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
