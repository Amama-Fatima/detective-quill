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
} from "lucide-react";
import { TextEditor, type ViewMode } from "@/components/workspace/text-editor";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { File, Folder, Tree } from "@/components/magicui/file-tree";

const STORAGE_KEY = "v0-markdown-files";

export type MarkdownFile = {
  id: string;
  name: string;
  content: string;
  updatedAt: string;
  isDirty?: boolean;
};

function createInitialFiles(): MarkdownFile[] {
  const now = new Date().toISOString();
  return [
    {
      id: crypto.randomUUID(),
      name: "Welcome.md",
      content: `# Welcome to Your Markdown Workspace

This is your enhanced markdown workspace with improved features:

## ✨ New Features
- **URL-based routing** - Each file has its own URL
- **Individual save buttons** - Save files independently  
- **Improved file tree** - Using Magic UI components
- **Better visual feedback** - See unsaved changes at a glance

## 🚀 Getting Started
- Use the toolbar to insert markdown (headings, bold, lists, code, etc.)
- Toggle between Edit, Preview, and Split view modes
- Files are automatically saved to localStorage
- Click the save button to persist changes immediately

## ⌨️ Keyboard Shortcuts
- **Cmd/Ctrl + B** - Bold text
- **Cmd/Ctrl + I** - Italic text  
- **Cmd/Ctrl + 1-3** - Headings
- **Cmd/Ctrl + L** - Insert link
- **Cmd/Ctrl + S** - Save file

Happy writing! 🎉`,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "Tasks.md",
      content: `# My Tasks

## 📋 Todo List
- [ ] Write a blog post about markdown
- [x] Try the new split view feature
- [ ] Add custom styling
- [ ] Share workspace with team

## 🎯 Project Goals
- [ ] Complete documentation
- [ ] Add export functionality
- [ ] Implement collaboration features

## 📸 Sample Image
![Markdown Logo](https://picsum.photos/seed/markdown/600/300)`,
      updatedAt: now,
    },
  ];
}

export function Workspace() {
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [savingFiles, setSavingFiles] = useState<Set<string>>(new Set());

  const router = useRouter();
  const searchParams = useSearchParams();

  // Load files from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: MarkdownFile[] = JSON.parse(raw);
        setFiles(parsed);

        // Check URL for file selection
        const fileParam = searchParams.get("file");
        if (fileParam) {
          const file = parsed.find((f) => f.id === fileParam);
          if (file) {
            setSelectedId(file.id);
          } else {
            setSelectedId(parsed[0]?.id ?? null);
          }
        } else {
          setSelectedId(parsed[0]?.id ?? null);
        }
      } else {
        const initial = createInitialFiles();
        setFiles(initial);
        setSelectedId(initial[0].id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        router.replace(`?file=${initial[0].id}`, { scroll: false });
      }
    } catch {
      const initial = createInitialFiles();
      setFiles(initial);
      setSelectedId(initial[0].id);
      router.replace(`?file=${initial[0].id}`, { scroll: false });
    }
  }, [searchParams, router]);

  // Update URL when file selection changes
  useEffect(() => {
    if (selectedId) {
      router.replace(`?file=${selectedId}`, { scroll: false });
    }
  }, [selectedId, router]);

  // Persist files to localStorage
  const persistFiles = useCallback((filesToSave: MarkdownFile[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filesToSave));
    } catch {
      // ignore storage errors
    }
  }, []);

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
    const now = new Date().toISOString();
    const newFile: MarkdownFile = {
      id: crypto.randomUUID(),
      name: "Untitled.md",
      content: "",
      updatedAt: now,
      isDirty: false,
    };
    const updatedFiles = [newFile, ...files];
    setFiles(updatedFiles);
    setSelectedId(newFile.id);
    persistFiles(updatedFiles);
  }

  function deleteFile(id: string) {
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
    persistFiles(updatedFiles);
  }

  function renameFile(id: string, name: string) {
    if (!name.endsWith(".md")) {
      name = `${name}.md`;
    }
    const updatedFiles = files.map((f) =>
      f.id === id ? { ...f, name, updatedAt: new Date().toISOString() } : f
    );
    setFiles(updatedFiles);
    persistFiles(updatedFiles);
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
    setSavingFiles((prev) => new Set(prev).add(id));

    // Simulate save delay for better UX feedback
    await new Promise((resolve) => setTimeout(resolve, 300));

    const updatedFiles = files.map((f) =>
      f.id === id ? { ...f, isDirty: false } : f
    );
    setFiles(updatedFiles);
    persistFiles(updatedFiles);

    setSavingFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }

  const FileTreeComponent = () => (
    <div className="p-3">
      {files.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No files yet</p>
          <Button size="sm" onClick={createFile} className="mt-2">
            Create your first file
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
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm">{file.name}</span>
                  {file.isDirty && (
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
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
                    <DropdownMenuItem
                      onClick={() =>
                        renameFile(file.id, file.name.replace(".md", ""))
                      }
                    >
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

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid h-screen w-full grid-rows-[auto_1fr] bg-background">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b px-4 py-3 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Markdown Workspace</h1>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Button size="sm" onClick={createFile} className="gap-2">
              <FilePlus className="h-4 w-4" />
              New File
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
                      savingFiles.has(selectedFile.id) || !selectedFile.isDirty
                    }
                    className={cn(
                      "gap-2 transition-all",
                      savingFiles.has(selectedFile.id) && "animate-pulse"
                    )}
                  >
                    {savingFiles.has(selectedFile.id) ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : selectedFile.isDirty ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {savingFiles.has(selectedFile.id)
                      ? "Saving..."
                      : selectedFile.isDirty
                      ? "Save"
                      : "Saved"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {selectedFile.isDirty
                    ? "Save changes (Cmd/Ctrl + S)"
                    : "File is up to date"}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Sidebar toggle button - now visible on all screen sizes */}
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
          {/* Sidebar - Now conditionally rendered based on sidebarOpen state */}
          {sidebarOpen && (
            <aside className="border-r bg-card/50">
              <div className="flex items-center justify-between p-3 border-b bg-card">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Files</span>
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
                    >
                      <FilePlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New file</TooltipContent>
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
                  <h2 className="text-2xl font-semibold">No file selected</h2>
                  <p className="text-muted-foreground max-w-sm">
                    Create a new file or select an existing one from the sidebar
                    to start editing.
                  </p>
                </div>
                <Button onClick={createFile} size="lg" className="gap-2">
                  <FilePlus className="h-5 w-5" />
                  Create your first file
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
