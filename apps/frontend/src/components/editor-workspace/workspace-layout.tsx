"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useFsNodes } from "@/hooks/use-fs-nodes";
import { useFocusModeStore } from "@/stores/use-focus-mode-store";
import { getProject } from "@/lib/backend-calls/projects";
import { getFsNode } from "@/lib/backend-calls/fs-nodes";
import { toast } from "sonner";
import { WorkspaceLoading } from "@/components/editor-workspace/loading-states";
import { WorkspaceError } from "@/components/editor-workspace/workspace-error";
import { WorkspaceSidebar } from "@/components/editor-workspace/workspace-sidebar";
import { WorkspaceHeaderBar } from "@/components/editor-workspace/workspace-header-bar";
import {
  FsNodeTreeResponse,
  FsNodeResponse,
} from "@detective-quill/shared-types";
import { countNodes } from "@/lib/utils";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  projectId: string;
}

export function WorkspaceLayout({ children, projectId }: WorkspaceLayoutProps) {
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [projectName, setProjectName] = useState<string>("");
  const [projectLoading, setProjectLoading] = useState(true);
  const [currentNode, setCurrentNode] = useState<FsNodeResponse | null>(null);
  const [nodeLoading, setNodeLoading] = useState(false);

  // Global state and hooks
  const focusMode = useFocusModeStore((state) => state.focusMode);
  const { session } = useAuth();
  const params = useParams();
  const nodeId = params.nodeId as string;

  const {
    nodes,
    loading: nodesLoading,
    error,
    setNodes,
  } = useFsNodes({ projectId });

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

  // Event handlers
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleNodesChange = (updatedNodes: FsNodeTreeResponse[]) => {
    setNodes(updatedNodes);
  };

  // Computed values
  const { files: filesCount, folders: foldersCount } = React.useMemo(() => {
    return countNodes(nodes);
  }, [nodes]);

  const showSidebar = sidebarOpen && focusMode === "NORMAL";
  const showHeader = focusMode === "NORMAL";

  // Loading state
  if (projectLoading || nodesLoading) {
    return <WorkspaceLoading />;
  }

  // Error state
  if (error) {
    return <WorkspaceError error={error} />;
  }

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      {showSidebar && (
        <WorkspaceSidebar
          projectName={projectName}
          filesCount={filesCount}
          foldersCount={foldersCount}
          nodes={nodes}
          onNodesChange={handleNodesChange}
          projectId={projectId}
          session={session}
          loading={nodesLoading}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        {showHeader && (
          <WorkspaceHeaderBar
            sidebarOpen={sidebarOpen}
            onSidebarToggle={handleSidebarToggle}
            projectName={projectName}
            nodeId={nodeId}
            currentNodePath={currentNode?.path ?? undefined}
            nodeLoading={nodeLoading}
          />
        )}

        {/* Children */}
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
