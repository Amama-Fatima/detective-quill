"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { createChapter } from "@/lib/api/chapters";
import { CreateChapterDto } from "@detective-quill/shared-types";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";
import { CreateChapterDialog } from "./create-chapter-dialog";
import { FileTreeItem } from "./file-tree-item";
import { ChapterFile } from "@/lib/types/workspace";

interface FileTreeProps {
  files: ChapterFile[];
  onFilesChange: (files: ChapterFile[]) => void;
  projectName: string;
  session: any;
  loading: boolean;
}

export function FileTree({
  files,
  onFilesChange,
  projectName,
  session,
  loading,
}: FileTreeProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const router = useRouter();
  const params = useParams();

  const selectedChapterName = params.chapterName as string;

  const selectedFile = useMemo(
    () => files.find((f) => f.slug === selectedChapterName),
    [files, selectedChapterName]
  );

  const handleFileSelect = (file: ChapterFile) => {
    router.push(`/workspace/${projectName}/${file.slug}`);
  };

  const handleCreateChapter = async (title: string) => {
    if (!session?.access_token) {
      toast.error("No session available");
      return;
    }

    setCreating(true);
    try {
      const nextOrder = Math.max(...files.map((f) => f.chapterOrder), 0) + 1;
      const slug = title.toLowerCase().replace(/\s+/g, "-");

      const createChapterData: CreateChapterDto = {
        projectTitle: projectName,
        title,
        content: "",
        chapterOrder: nextOrder,
      };

      const response = await createChapter(
        createChapterData,
        session.access_token
      );

      if (response.success && response.data) {
        const newFile: ChapterFile = {
          id: response.data.id,
          name: `${title}.md`,
          slug,
          content: "",
          updatedAt: response.data.updated_at,
          isDirty: false,
          isNew: false,
          chapterOrder: nextOrder,
          originalChapter: response.data,
        };

        const updatedFiles = [...files, newFile].sort(
          (a, b) => a.chapterOrder - b.chapterOrder
        );
        onFilesChange(updatedFiles);

        // Navigate to the new chapter
        router.push(`/workspace/${projectName}/${slug}`);

        toast.success("Chapter created successfully");
        setCreateDialogOpen(false);
      } else {
        toast.error(response.message || "Failed to create chapter");
      }
    } catch (error) {
      console.error("Error creating chapter:", error);
      toast.error("Failed to create chapter");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    // TODO: Implement delete API call
    const updatedFiles = files.filter((f) => f.id !== fileId);
    onFilesChange(updatedFiles);

    // If deleted file was selected, navigate to first available file
    if (selectedFile?.id === fileId) {
      if (updatedFiles.length > 0) {
        router.push(`/workspace/${projectName}/${updatedFiles[0].slug}`);
      } else {
        router.push(`/workspace/${projectName}`);
      }
    }
  };

  const handleRenameFile = (fileId: string, newTitle: string) => {
    const newSlug = newTitle.toLowerCase().replace(/\s+/g, "-");
    const updatedFiles = files.map((f) =>
      f.id === fileId
        ? {
            ...f,
            name: `${newTitle}.md`,
            slug: newSlug,
            isDirty: true,
          }
        : f
    );
    onFilesChange(updatedFiles);

    // Update URL if this is the selected file
    if (selectedFile?.id === fileId) {
      router.push(`/workspace/${projectName}/${newSlug}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading chapters...
        </span>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8 px-4">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm mb-4">No chapters yet</p>
        <Button
          size="sm"
          onClick={() => setCreateDialogOpen(true)}
          className="w-full"
        >
          Create your first chapter
        </Button>
        <CreateChapterDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={handleCreateChapter}
          creating={creating}
        />
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {files.map((file) => (
            <FileTreeItem
              key={file.id}
              file={file}
              isSelected={selectedFile?.id === file.id}
              onClick={() => handleFileSelect(file)}
              onDelete={() => handleDeleteFile(file.id)}
              onRename={(newTitle) => handleRenameFile(file.id, newTitle)}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <Button
          size="sm"
          onClick={() => setCreateDialogOpen(true)}
          className="w-full gap-2"
          disabled={!session}
        >
          <span className="text-lg">+</span>
          New Chapter
        </Button>
      </div>

      <CreateChapterDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateChapter}
        creating={creating}
      />
    </>
  );
}
