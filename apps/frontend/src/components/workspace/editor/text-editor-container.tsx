// File: src/components/workspace/text-editor-container.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TextEditor } from "@/components/workspace/editor/text-editor";
import { createSupabaseBrowserClient } from "@/supabase/browser-client";
import { getChapters, updateChapter } from "@/lib/api/chapters";
import { UpdateChapterDto } from "@detective-quill/shared-types";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";
import { ChapterFile } from "@/lib/types/workspace";

interface TextEditorContainerProps {
  projectName: string;
  chapterName: string;
}

type FocusMode = "normal" | "app" | "browser";

export function TextEditorContainer({
  projectName,
  chapterName,
}: TextEditorContainerProps) {
  const [file, setFile] = useState<ChapterFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [session, setSession] = useState<any | null>(null);
  const [focusMode, setFocusMode] = useState<FocusMode>("normal");

  const router = useRouter();
  const supabaseBrowserClient = createSupabaseBrowserClient();

  // Get session
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

  // Load specific chapter
  useEffect(() => {
    if (!session?.access_token || !chapterName) return;

    const fetchChapter = async () => {
      setLoading(true);
      try {
        const response = await getChapters(projectName, session.access_token);

        if (response.success) {
          const chapters = response.data;
          const targetChapter = chapters.find(
            (chapter) =>
              chapter.title.toLowerCase().replace(/\s+/g, "-") === chapterName
          );

          if (targetChapter) {
            const chapterFile: ChapterFile = {
              id: targetChapter.id,
              name: `${targetChapter.title}.md`,
              slug: targetChapter.title.toLowerCase().replace(/\s+/g, "-"),
              content: targetChapter.content || "",
              updatedAt: targetChapter.updated_at,
              isDirty: false,
              isNew: false,
              chapterOrder: targetChapter.chapter_order,
              originalChapter: targetChapter,
            };

            setFile(chapterFile);
          } else {
            toast.error("Chapter not found");
            router.push(`/workspace/${projectName}`);
          }
        } else {
          toast.error(response.message || "Failed to load chapter");
        }
      } catch (error) {
        console.error("Error fetching chapter:", error);
        toast.error("Failed to load chapter");
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [session, projectName, chapterName, router]);

  const updateContent = (content: string) => {
    if (!file) return;

    setFile((prev) =>
      prev
        ? {
            ...prev,
            content,
            updatedAt: new Date().toISOString(),
            isDirty: true,
          }
        : null
    );
  };

  const saveFile = async () => {
    if (!file || !session?.access_token) {
      toast.error("Cannot save: missing file or session");
      return;
    }

    if (!file.originalChapter) {
      toast.error("Cannot save: no original chapter data");
      return;
    }

    setSaving(true);
    try {
      const title = file.name.replace(".md", "");
      const updateData: Omit<UpdateChapterDto, "id"> = {
        title,
        content: file.content,
      };
      const response = await updateChapter(
        file.originalChapter.id,
        updateData,
        session.access_token
      );

      if (response.success && response.data) {
        setFile((prev) =>
          prev
            ? {
                ...prev,
                isDirty: false,
                originalChapter: response.data,
              }
            : null
        );
        toast.success("Chapter saved successfully");
      } else {
        toast.error(response.message || "Failed to save chapter");
      }
    } catch (error) {
      console.error("Error saving chapter:", error);
      toast.error("Failed to save chapter");
    } finally {
      setSaving(false);
    }
  };

  const deleteFile = () => {
    // TODO: Implement delete functionality
    toast.info("Delete functionality will be implemented");
  };

  const handleFocusModeChange = (mode: FocusMode) => {
    setFocusMode(mode);

    // Hide/show body overflow for app focus mode
    if (mode === "app") {
      document.body.style.overflow = "hidden";
    } else if (mode === "normal") {
      document.body.style.overflow = "";
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-muted p-6">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Chapter not found</h2>
            <p className="text-sm text-muted-foreground">
              The chapter you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TextEditor
      fileName={file.name}
      value={file.content}
      onChange={updateContent}
      onDelete={deleteFile}
      isDirty={file.isDirty}
      isSaving={saving}
      onSave={saveFile}
      onFocusModeChange={handleFocusModeChange}
    />
  );
}
