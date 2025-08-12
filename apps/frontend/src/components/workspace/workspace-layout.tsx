"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { useAuth } from "@/context/auth-context";
import { useChapters } from "@/hooks/use-chapters";
import { cn } from "@/lib/utils";
import { EnhancedFileTree } from "./file-tree/file-tree";
import { ChapterFile } from "@/lib/types/workspace";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  projectName: string;
}

export function WorkspaceLayout({
  children,
  projectName,
}: WorkspaceLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [focusMode, setFocusMode] = useState<"normal" | "app" | "browser">(
    "normal"
  );
  const [chapterFiles, setChapterFiles] = useState<ChapterFile[]>([]);

  const {
    chapterFiles: initialFiles,
    loading,
    error,
    refetch,
  } = useChapters({ projectName });
  const { session } = useAuth();
  const params = useParams();

  useEffect(() => {
    setChapterFiles(initialFiles);
  }, [initialFiles]);

  const updateChapterFiles = (updatedFiles: ChapterFile[]) => {
    setChapterFiles(updatedFiles);
  };

  // Handle focus mode changes from editor
  const handleFocusModeChange = (mode: "normal" | "app" | "browser") => {
    setFocusMode(mode);
  };

  // Hide sidebar in focus modes
  const showSidebar = sidebarOpen && focusMode === "normal";

  if (loading) {
    return <div>Loading...</div>;
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
            filesCount={chapterFiles.length}
            onCreateFile={() => {
              // This will be handled by EnhancedFileTree component
            }}
          />
          <EnhancedFileTree
            files={chapterFiles}
            onFilesChange={updateChapterFiles}
            projectName={projectName}
            session={session}
            loading={loading}
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
              <span className="text-sm text-muted-foreground">
                {projectName} / {params.chapterName}
              </span>
            </div>
          </div>
        )}

        {/* Pass focus mode handler to children */}
        <div className="flex-1">
          {React.cloneElement(children, {
            onFocusModeChange: handleFocusModeChange,
          })}
        </div>
      </main>
    </div>
  );
}
