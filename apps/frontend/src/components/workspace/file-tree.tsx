"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createChapter } from "@/lib/api/chapters";
import { CreateChapterDto } from "@detective-quill/shared-types";
import { toast } from "sonner";
import {
  FileText,
  Loader2,
  Plus,
  FolderPlus,
  MoreHorizontal,
  File as FileIcon,
  Folder,
  FolderOpen,
} from "lucide-react";
import { CreateChapterDialog } from "./create-chapter-dialog";
import { ChapterFile, FolderStructure } from "@/lib/types/workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CreateFolderDialog } from "./create-folder-dialog";
import {
  File,
  Tree,
  TreeViewElement,
  Folder as TreeFolder,
} from "../magicui/file-tree";

interface EnhancedFileTreeProps {
  files: ChapterFile[];
  onFilesChange: (files: ChapterFile[]) => void;
  projectName: string;
  session: any;
  loading: boolean;
}

// Sample folder structure - this would come from your database
const sampleFolders: FolderStructure[] = [
  { id: "part-1", name: "Part I: The Beginning", parentId: null, order: 1 },
  { id: "part-2", name: "Part II: The Journey", parentId: null, order: 2 },
  {
    id: "characters",
    name: "Character Development",
    parentId: "part-1",
    order: 1,
  },
  { id: "world-building", name: "World Building", parentId: null, order: 3 },
];

export function EnhancedFileTree({
  files,
  onFilesChange,
  projectName,
  session,
  loading,
}: EnhancedFileTreeProps) {
  const [createChapterOpen, setCreateChapterOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const selectedChapterName = params.chapterName as string;

  // Build tree structure from files and folders
  const treeElements: TreeViewElement[] = useMemo(() => {
    const folders = sampleFolders; // This would come from your API
    const elements: TreeViewElement[] = [];

    // Create folder map for easy lookup
    const folderMap = new Map<string, TreeViewElement>();

    // First, create all folder elements
    folders.forEach((folder) => {
      const folderElement: TreeViewElement = {
        id: folder.id,
        name: folder.name,
        isSelectable: false,
        children: [],
      };
      folderMap.set(folder.id, folderElement);
    });

    // Build folder hierarchy
    folders.forEach((folder) => {
      const folderElement = folderMap.get(folder.id);
      if (!folderElement) return;

      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(folderElement);
        }
      } else {
        elements.push(folderElement);
      }
    });

    // Add files to appropriate folders or root
    files.forEach((file) => {
      const fileElement: TreeViewElement = {
        id: file.slug,
        name: file.name.replace(".md", ""),
        isSelectable: true,
      };

      if (file.folder) {
        const targetFolder = folderMap.get(file.folder);
        if (targetFolder) {
          targetFolder.children = targetFolder.children || [];
          targetFolder.children.push(fileElement);
        } else {
          // Folder not found, add to root
          elements.push(fileElement);
        }
      } else {
        // No folder specified, add to root
        elements.push(fileElement);
      }
    });

    return elements;
  }, [files, sampleFolders]);

  const selectedFile = useMemo(
    () => files.find((f) => f.slug === selectedChapterName),
    [files, selectedChapterName]
  );

  const handleFileSelect = (slug: string) => {
    router.push(`/workspace/${projectName}/${slug}`);
  };

  const handleCreateChapter = async (title: string, folderId?: string) => {
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
        folderId: folderId || selectedFolder || null, // Use correct property name
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
          folder: folderId || selectedFolder,
        };

        const updatedFiles = [...files, newFile].sort(
          (a, b) => a.chapterOrder - b.chapterOrder
        );
        onFilesChange(updatedFiles);

        router.push(`/workspace/${projectName}/${slug}`);
        toast.success("Chapter created successfully");
        setCreateChapterOpen(false);
        setSelectedFolder(null);
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

  const handleCreateFolder = async (name: string) => {
    // TODO: Implement folder creation API
    toast.success(`Folder "${name}" created`);
    setCreateFolderOpen(false);
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

  return (
    <div className="flex flex-col h-full">
      {/* Action Buttons */}
      <div className="p-3 border-b bg-card/20">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="flex-1 gap-2">
                <Plus className="h-4 w-4" />
                New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => setCreateChapterOpen(true)}>
                <FileText className="h-4 w-4 mr-2" />
                New Chapter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCreateFolderOpen(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-hidden">
        {treeElements.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 px-4">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm mb-4">No chapters yet</p>
            <Button
              size="sm"
              onClick={() => setCreateChapterOpen(true)}
              className="w-full"
            >
              Create your first chapter
            </Button>
          </div>
        ) : (
          <Tree
            className="h-full p-2"
            initialSelectedId={selectedChapterName}
            elements={treeElements}
            indicator={true}
            openIcon={<FolderOpen className="h-4 w-4" />}
            closeIcon={<Folder className="h-4 w-4" />}
          >
            {treeElements.map((element) => (
              <TreeItem
                key={element.id}
                element={element}
                selectedChapterName={selectedChapterName}
                onFileSelect={handleFileSelect}
                onFolderContextMenu={setSelectedFolder}
                files={files}
              />
            ))}
          </Tree>
        )}
      </div>

      {/* Dialogs */}
      <CreateChapterDialog
        open={createChapterOpen}
        onOpenChange={setCreateChapterOpen}
        onSubmit={handleCreateChapter}
        creating={creating}
        folderName={
          selectedFolder
            ? sampleFolders.find((f) => f.id === selectedFolder)?.name
            : undefined
        }
      />

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onSubmit={handleCreateFolder}
      />
    </div>
  );
}

// Recursive Tree Item Component
function TreeItem({
  element,
  selectedChapterName,
  onFileSelect,
  onFolderContextMenu,
  files,
}: {
  element: TreeViewElement;
  selectedChapterName: string;
  onFileSelect: (slug: string) => void;
  onFolderContextMenu: (folderId: string) => void;
  files: ChapterFile[];
}) {
  const file = files.find((f) => f.slug === element.id);
  const isSelected = selectedChapterName === element.id;

  if (element.isSelectable === false) {
    // This is a folder
    return (
      <TreeFolder
        value={element.id}
        element={element.name}
        className="px-2 py-1 group"
      >
        {element.children?.map((child) => (
          <TreeItem
            key={child.id}
            element={child}
            selectedChapterName={selectedChapterName}
            onFileSelect={onFileSelect}
            onFolderContextMenu={onFolderContextMenu}
            files={files}
          />
        ))}

        {/* Folder Actions */}
        <div className="ml-6 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs"
            onClick={() => onFolderContextMenu(element.id)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Chapter
          </Button>
        </div>
      </TreeFolder>
    );
  } else {
    // This is a file - use asChild to avoid nested buttons
    return (
      <File
        value={element.id}
        isSelect={isSelected}
        handleSelect={onFileSelect}
        className={cn(
          "px-2 py-1 group flex items-center justify-between",
          isSelected && "bg-primary/10 text-primary"
        )}
        fileIcon={<FileIcon className="h-4 w-4" />}
        asChild
      >
        <div
          onClick={() => onFileSelect(element.id)}
          className="flex items-center justify-between w-full cursor-pointer"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileIcon className="h-4 w-4" />
            <span className="truncate">{element.name}</span>
            {file?.isDirty && (
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0" />
            )}
            {file?.isNew && (
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
                className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Move to...</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </File>
    );
  }
}
