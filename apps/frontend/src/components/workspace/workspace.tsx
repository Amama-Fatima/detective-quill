"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  FilePlus,
  FolderTree,
  Save,
  Search,
  Trash2,
  MoreVertical,
  FileText,
  PanelLeft,
} from "lucide-react";
import { FileTree, type MarkdownFile } from "@/components/workspace/file-tree";
import { TextEditor, type ViewMode } from "@/components/workspace/text-editor";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STORAGE_KEY = "v0-markdown-files";

function createInitialFiles(): MarkdownFile[] {
  const now = new Date().toISOString();
  return [
    {
      id: crypto.randomUUID(),
      name: "Welcome.md",
      content: `# Welcome

This is your markdown workspace.

- Use the toolbar to insert markdown (headings, bold, lists, code, etc.).
- Toggle View to switch between Edit, Preview, and Split.
- Files are stored locally in your browser (localStorage).
- Right-click (or •••) a file to rename or delete.

Happy writing!`,
      updatedAt: now,
    },
    {
      id: crypto.randomUUID(),
      name: "Tasks.md",
      content: `# Tasks

- [ ] Write a blog post
- [x] Try the split view
- [ ] Add an image: ![alt text](https://picsum.photos/seed/markdown/800/400)`,
      updatedAt: now,
    },
  ];
}

export function Workspace() {
  const [files, setFiles] = useState<MarkdownFile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("split");

  // Load files from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: MarkdownFile[] = JSON.parse(raw);
        setFiles(parsed);
        setSelectedId(parsed[0]?.id ?? null);
      } else {
        const initial = createInitialFiles();
        setFiles(initial);
        setSelectedId(initial[0].id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      }
    } catch {
      const initial = createInitialFiles();
      setFiles(initial);
      setSelectedId(initial[0].id);
    }
  }, []);

  // Persist files to localStorage
  useEffect(() => {
    if (!files.length) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch {
      // ignore
    }
  }, [files]);

  // Fake save pulse
  const triggerSavePulse = () => {
    setIsSaving(true);
    const t = setTimeout(() => setIsSaving(false), 400);
    return () => clearTimeout(t);
  };

  const selectedFile = useMemo(
    () => files.find((f) => f.id === selectedId) ?? null,
    [files, selectedId]
  );

  const filteredFiles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return files;
    return files.filter((f) => f.name.toLowerCase().includes(q));
  }, [files, query]);

  function createFile() {
    const now = new Date().toISOString();
    const newFile: MarkdownFile = {
      id: crypto.randomUUID(),
      name: "Untitled.md",
      content: "",
      updatedAt: now,
    };
    setFiles((prev) => [newFile, ...prev]);
    setSelectedId(newFile.id);
    triggerSavePulse();
  }

  function deleteFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedId === id) {
      setSelectedId((prev) => {
        const remaining = files.filter((f) => f.id !== id);
        return remaining[0]?.id ?? null;
      });
    }
    triggerSavePulse();
  }

  function renameFile(id: string, name: string) {
    if (!name.endsWith(".md")) {
      name = `${name}.md`;
    }
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, name, updatedAt: new Date().toISOString() } : f
      )
    );
    triggerSavePulse();
  }

  function updateContent(id: string, content: string) {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, content, updatedAt: new Date().toISOString() } : f
      )
    );
  }

  function saveNow() {
    // Persist and show saved pulse
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    } catch {
      // ignore
    }
    triggerSavePulse();
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid h-screen w-full grid-rows-[auto_1fr]">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex items-center gap-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle file tree"
                >
                  <PanelLeft className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <div className="flex h-full flex-col">
                  <div className="flex items-center gap-2 p-3 border-b">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search files"
                      className="h-8"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={createFile}
                          aria-label="New file"
                        >
                          <FilePlus className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>New file</TooltipContent>
                    </Tooltip>
                  </div>
                  <ScrollArea className="flex-1">
                    <FileTree
                      files={filteredFiles}
                      selectedId={selectedId ?? undefined}
                      onSelect={(id) => {
                        setSelectedId(id);
                        setSidebarOpen(false);
                      }}
                      onRename={renameFile}
                      onDelete={deleteFile}
                    />
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>

            <FolderTree className="h-5 w-5 text-muted-foreground hidden md:block" />
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search files"
                  className="h-9 pl-8 w-[240px]"
                />
              </div>
              <Separator orientation="vertical" className="mx-1 h-6" />
              <Button size="sm" onClick={createFile} className="gap-2">
                <FilePlus className="h-4 w-4" />
                {"New"}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveNow}
                  className={cn("gap-2", isSaving ? "animate-pulse" : "")}
                >
                  <Save className="h-4 w-4" />
                  {"Save"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cmd/Ctrl + S</TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={createFile}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  {"New file"}
                </DropdownMenuItem>
                {selectedFile ? (
                  <DropdownMenuItem
                    onClick={() => deleteFile(selectedFile.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {"Delete current"}
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside className="hidden border-r md:block">
            <div className="flex items-center gap-2 p-3 border-b">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files"
                className="h-8"
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={createFile}
                    aria-label="New file"
                  >
                    <FilePlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New file</TooltipContent>
              </Tooltip>
            </div>
            <ScrollArea className="h-[calc(100vh-56px)]">
              <FileTree
                files={filteredFiles}
                selectedId={selectedId ?? undefined}
                onSelect={setSelectedId}
                onRename={renameFile}
                onDelete={deleteFile}
              />
            </ScrollArea>
          </aside>

          {/* Editor */}
          <section className="min-h-[calc(100vh-56px)]">
            {selectedFile ? (
              <TextEditor
                key={selectedFile.id}
                fileName={selectedFile.name}
                value={selectedFile.content}
                onChange={(next) => updateContent(selectedFile.id, next)}
                onDelete={() => deleteFile(selectedFile.id)}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center p-6">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div className="text-lg font-medium">{"No file selected"}</div>
                <div className="text-sm text-muted-foreground">
                  {"Create or select a file from the file tree."}
                </div>
                <Button onClick={createFile} className="mt-2 gap-2">
                  <FilePlus className="h-4 w-4" />
                  {"New file"}
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
