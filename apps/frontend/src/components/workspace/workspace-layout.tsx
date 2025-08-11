"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { FileTree } from "@/components/workspace/file-tree";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { createSupabaseBrowserClient } from "@/supabase/browser-client";
import { getChapters } from "@/lib/api/chapters";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ChapterFile } from "@/lib/types/workspace";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  projectName: string;
}

export function WorkspaceLayout({
  children,
  projectName,
}: WorkspaceLayoutProps) {
  const [files, setFiles] = useState<ChapterFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const router = useRouter();
  const params = useParams();
  const supabaseBrowserClient = createSupabaseBrowserClient();

  // Get session on mount
  useEffect(() => {
    async function getSession() {
      try {
        const { data, error } = await supabaseBrowserClient.auth.getSession();
        if (error) {
          console.error("Error fetching session:", error);
          toast.error("Failed to get session");
          return;
        }
        setSession(data.session);
      } catch (error) {
        console.error("Error fetching session:", error);
        toast.error("Failed to get session");
      }
    }
    getSession();
  }, []);

  // Load chapters from database
  useEffect(() => {
    if (!session?.access_token) return;

    const fetchChapters = async () => {
      setLoading(true);
      try {
        const response = await getChapters(projectName, session.access_token);

        if (response.success) {
          const chapterFiles: ChapterFile[] = response.data.map((chapter) => ({
            id: chapter.id,
            name: `${chapter.title}.md`,
            slug: chapter.title.toLowerCase().replace(/\s+/g, "-"),
            content: chapter.content || "",
            updatedAt: chapter.updated_at,
            isDirty: false,
            isNew: false,
            chapterOrder: chapter.chapter_order,
            originalChapter: chapter,
          }));

          // Sort by chapter order
          chapterFiles.sort((a, b) => a.chapterOrder - b.chapterOrder);
          setFiles(chapterFiles);

          // Redirect to first chapter if no chapter is selected
          if (!params.chapterName && chapterFiles.length > 0) {
            router.replace(`/workspace/${projectName}/${chapterFiles[0].slug}`);
          }
        } else {
          toast.error(response.message || "Failed to load chapters");
        }
      } catch (error) {
        console.error("Error fetching chapters:", error);
        toast.error("Failed to load chapters");
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [session, projectName, params.chapterName, router]);

  const updateFiles = (updatedFiles: ChapterFile[]) => {
    setFiles(updatedFiles);
  };

  return (
    <div className="flex h-screen w-full bg-background">
      {sidebarOpen && (
        <aside className={cn("w-80 border-r bg-card/50 flex flex-col")}>
          <WorkspaceHeader
            projectName={projectName}
            filesCount={files.length}
            onCreateFile={() => {
              // This will be handled by FileTree component
            }}
          />
          <FileTree
            files={files}
            onFilesChange={updateFiles}
            projectName={projectName}
            session={session}
            loading={loading}
          />
        </aside>
      )}

      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center justify-between border-b px-4 py-2 bg-card/30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-muted rounded-md transition-colors"
            >
              {sidebarOpen ? "←" : "→"}
            </button>
            <span className="text-sm text-muted-foreground">
              {projectName} / {params.chapterName}
            </span>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
