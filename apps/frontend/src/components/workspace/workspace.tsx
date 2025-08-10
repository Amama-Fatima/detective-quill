"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  FilePlus,
  FolderTree,
  Save,
  Trash2,
  MoreVertical,
  FileText,
  PanelLeft,
  PanelRight,
  Check,
  Loader2,
} from "lucide-react";
import { TextEditor, type ViewMode } from "@/components/workspace/text-editor";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { File, Folder, Tree } from "@/components/magicui/file-tree";
import { createSupabaseBrowserClient } from "@/supabase/browser-client";
import { getChapters, createChapter, updateChapter } from "@/lib/api/chapters";
import {
  ChapterWithProject,
  CreateChapterDto,
  UpdateChapterDto,
} from "@detective-quill/shared-types";
import { toast } from "sonner"; // or your preferred toast library

export type ChapterFile = {
  id: string;
  name: string;
  content: string;
  updatedAt: string;
  isDirty?: boolean;
  isNew?: boolean; // Flag to indicate if this is a new chapter not yet saved to DB
  chapterOrder: number;
  originalChapter?: ChapterWithProject; // Store original chapter data
};

interface WorkspaceProps {
  projectTitle: string; // Pass this as a prop to specify which project's chapters to load
}

export function Workspace({ projectTitle = "and" }: WorkspaceProps) {
  const [files, setFiles] = useState<ChapterFile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [savingFiles, setSavingFiles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renamingFile, setRenamingFile] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newFileName, setNewFileName] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
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
        const response = await getChapters(projectTitle, session.access_token);

        if (response.success) {
          const chapterFiles: ChapterFile[] = response.data.map((chapter) => ({
            id: chapter.id,
            name: `${chapter.title}.md`,
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

          // Check URL for file selection
          const fileParam = searchParams.get("file");
          if (fileParam) {
            const file = chapterFiles.find((f) => f.id === fileParam);
            if (file) {
              setSelectedId(file.id);
            } else {
              setSelectedId(chapterFiles[0]?.id ?? null);
            }
          } else {
            setSelectedId(chapterFiles[0]?.id ?? null);
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
  }, [session, projectTitle, searchParams]);

  // Update URL when file selection changes
  useEffect(() => {
    if (selectedId) {
      router.replace(`?file=${selectedId}`, { scroll: false });
    }
  }, [selectedId, router]);

  const selectedFile = useMemo(
    () => files.find((f) => f.id === selectedId) ?? null,
    [files, selectedId]
  );

  // Convert files to tree structure for Magic UI
  const treeElements = useMemo(() => {
    return files.map((file) => ({
      id: file.id,
      isSelectable: true,
      name: file.name,
      isDirty: file.isDirty,
    }));
  }, [files]);

  function createFile() {
    if (!session?.access_token) {
      toast.error("No session available");
      return;
    }

    const now = new Date().toISOString();
    const nextOrder = Math.max(...files.map((f) => f.chapterOrder), 0) + 1;

    const newFile: ChapterFile = {
      id: crypto.randomUUID(), // Temporary ID until saved to DB
      name: "Untitled Chapter.md",
      content: "",
      updatedAt: now,
      isDirty: true,
      isNew: true,
      chapterOrder: nextOrder,
    };

    const updatedFiles = [newFile, ...files];
    setFiles(updatedFiles);
    setSelectedId(newFile.id);
  }

  function deleteFile(id: string) {
    // TODO: Implement delete chapter API call if the file is not new
    const file = files.find((f) => f.id === id);
    if (file && !file.isNew) {
      // Call delete chapter API here
      console.log(
        "TODO: Delete chapter from database",
        file.originalChapter?.id
      );
    }

    const updatedFiles = files.filter((f) => f.id !== id);
    setFiles(updatedFiles);

    if (selectedId === id) {
      const newSelected = updatedFiles[0]?.id ?? null;
      setSelectedId(newSelected);
      if (newSelected) {
        router.replace(`?file=${newSelected}`, { scroll: false });
      } else {
        router.replace("/", { scroll: false });
      }
    }
  }

  function renameFile(id: string, name: string) {
    if (!name.trim()) return;

    if (!name.endsWith(".md")) {
      name = `${name}.md`;
    }

    const updatedFiles = files.map((f) =>
      f.id === id
        ? {
            ...f,
            name,
            updatedAt: new Date().toISOString(),
            isDirty: true, // Mark as dirty since title changed
          }
        : f
    );
    setFiles(updatedFiles);
  }

  function openRenameDialog(file: ChapterFile) {
    setRenamingFile({ id: file.id, name: file.name });
    setNewFileName(file.name.replace(".md", ""));
    setRenameDialogOpen(true);
  }

  function handleRename() {
    if (renamingFile && newFileName.trim()) {
      renameFile(renamingFile.id, newFileName.trim());
      setRenameDialogOpen(false);
      setRenamingFile(null);
      setNewFileName("");
    }
  }

  function cancelRename() {
    setRenameDialogOpen(false);
    setRenamingFile(null);
    setNewFileName("");
  }

  function updateContent(id: string, content: string) {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              content,
              updatedAt: new Date().toISOString(),
              isDirty: true,
            }
          : f
      )
    );
  }

  async function saveFile(id: string) {
    if (!session?.access_token) {
      toast.error("No session available");
      return;
    }

    const file = files.find((f) => f.id === id);
    if (!file) return;

    setSavingFiles((prev) => new Set(prev).add(id));

    try {
      const title = file.name.replace(".md", "");

      if (file.isNew) {
        // Create new chapter
        const createChapterData: CreateChapterDto = {
          projectTitle,
          title,
          content: file.content,
          chapterOrder: file.chapterOrder,
        };

        const response = await createChapter(
          createChapterData,
          session.access_token
        );

        if (response.success && response.data) {
          // Update the file with the new chapter data
          const updatedFiles = files.map((f) =>
            f.id === id
              ? {
                  ...f,
                  id: response.data!.id, // Use the actual chapter ID from database
                  isDirty: false,
                  isNew: false,
                  originalChapter: response.data,
                }
              : f
          );
          setFiles(updatedFiles);

          // Update selected ID if this was the selected file
          if (selectedId === id) {
            setSelectedId(response.data.id);
            router.replace(`?file=${response.data.id}`, { scroll: false });
          }

          toast.success("Chapter created successfully");
        } else {
          toast.error(response.message || "Failed to create chapter");
        }
      } else {
        // Update existing chapter
        if (!file.originalChapter) {
          toast.error("No original chapter data found");
          return;
        }

        const updateChapterData: Omit<UpdateChapterDto, "id"> = {
          title,
          content: file.content,
        };

        const response = await updateChapter(
          file.originalChapter.id,
          updateChapterData,
          session.access_token
        );

        if (response.success && response.data) {
          const updatedFiles = files.map((f) =>
            f.id === id
              ? {
                  ...f,
                  isDirty: false,
                  originalChapter: response.data,
                }
              : f
          );
          setFiles(updatedFiles);
          toast.success("Chapter updated successfully");
        } else {
          toast.error(response.message || "Failed to update chapter");
        }
      }
    } catch (error) {
      console.error("Error saving chapter:", error);
      toast.error("Failed to save chapter");
    } finally {
      setSavingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }

  const FileTreeComponent = () => (
    <div className="p-3">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading chapters...
          </span>
        </div>
      ) : files.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No chapters yet</p>
          <Button size="sm" onClick={createFile} className="mt-2">
            Create your first chapter
          </Button>
        </div>
      ) : (
        <Tree
          className="w-full"
          initialSelectedId={selectedId || undefined}
          elements={treeElements}
        >
          {files.map((file) => (
            <File
              key={file.id}
              value={file.id}
              asChild
              className={cn(
                "group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60 cursor-pointer transition-colors",
                selectedId === file.id ? "bg-muted" : "bg-transparent"
              )}
            >
              <div
                className="flex items-center justify-between w-full"
                onClick={() => setSelectedId(file.id)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm">{file.name}</span>
                  {file.isDirty && (
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
                  )}
                  {file.isNew && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem onClick={() => openRenameDialog(file)}>
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteFile(file.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </File>
          ))}
        </Tree>
      )}
    </div>
  );

  if (loading && !session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-lg">Loading workspace...</span>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid h-screen w-full grid-rows-[auto_1fr] bg-background">
        {/* Rename Dialog */}
        <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Rename Chapter</DialogTitle>
              <DialogDescription>
                Enter a new title for your chapter. The .md extension will be
                added automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="filename" className="text-right">
                  Title
                </Label>
                <Input
                  id="filename"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter chapter title..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleRename();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      cancelRename();
                    }
                  }}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={cancelRename}>
                Cancel
              </Button>
              <Button onClick={handleRename} disabled={!newFileName.trim()}>
                Rename
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Top bar */}
        <header className="flex items-center justify-between border-b px-4 py-3 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">
                {projectTitle} - Chapters
              </h1>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Button
              size="sm"
              onClick={createFile}
              className="gap-2"
              disabled={!session}
            >
              <FilePlus className="h-4 w-4" />
              New Chapter
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {selectedFile && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={selectedFile.isDirty ? "default" : "outline"}
                    size="sm"
                    onClick={() => saveFile(selectedFile.id)}
                    disabled={
                      savingFiles.has(selectedFile.id) ||
                      !selectedFile.isDirty ||
                      !session
                    }
                    className={cn(
                      "gap-2 transition-all",
                      savingFiles.has(selectedFile.id) && "animate-pulse"
                    )}
                  >
                    {savingFiles.has(selectedFile.id) ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : selectedFile.isDirty ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {savingFiles.has(selectedFile.id)
                      ? "Saving..."
                      : selectedFile.isDirty
                      ? selectedFile.isNew
                        ? "Create"
                        : "Save"
                      : "Saved"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {selectedFile.isDirty
                    ? selectedFile.isNew
                      ? "Create chapter in database (Cmd/Ctrl + S)"
                      : "Save changes (Cmd/Ctrl + S)"
                    : "Chapter is up to date"}
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="gap-2"
                >
                  {sidebarOpen ? (
                    <PanelLeft className="h-4 w-4" />
                  ) : (
                    <PanelRight className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {sidebarOpen ? "Hide sidebar" : "Show sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Body */}
        <div
          className={cn(
            "grid min-h-0 transition-all duration-200",
            sidebarOpen ? "grid-cols-[300px_1fr]" : "grid-cols-1"
          )}
        >
          {/* Sidebar */}
          {sidebarOpen && (
            <aside className="border-r bg-card/50">
              <div className="flex items-center justify-between p-3 border-b bg-card">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Chapters</span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {files.length}
                  </span>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={createFile}
                      className="h-7 w-7"
                      disabled={!session}
                    >
                      <FilePlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New chapter</TooltipContent>
                </Tooltip>
              </div>
              <ScrollArea className="h-[calc(100vh-120px)]">
                <FileTreeComponent />
              </ScrollArea>
            </aside>
          )}

          {/* Editor */}
          <section className="min-h-[calc(100vh-80px)] bg-background">
            {selectedFile ? (
              <TextEditor
                key={selectedFile.id}
                fileName={selectedFile.name}
                value={selectedFile.content}
                onChange={(next) => updateContent(selectedFile.id, next)}
                onDelete={() => deleteFile(selectedFile.id)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                isDirty={selectedFile.isDirty}
                isSaving={savingFiles.has(selectedFile.id)}
                onSave={() => saveFile(selectedFile.id)}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 text-center p-8">
                <div className="rounded-full bg-muted p-6">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold">
                    No chapter selected
                  </h2>
                  <p className="text-muted-foreground max-w-sm">
                    Create a new chapter or select an existing one from the
                    sidebar to start editing.
                  </p>
                </div>
                <Button
                  onClick={createFile}
                  size="lg"
                  className="gap-2"
                  disabled={!session}
                >
                  <FilePlus className="h-5 w-5" />
                  Create your first chapter
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default Workspace;
