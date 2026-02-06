"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Trash2,
  Save,
  Check,
  Edit3,
  Maximize,
  Minimize,
  Focus,
  MessageSquare,
} from "lucide-react";
import { cn, getContainerClass, getHeaderClass } from "@/lib/utils/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dynamic from "next/dynamic";
import { useFocusMode } from "@/hooks/text-editor/use-focus-mode";
import type { BlockNoteEditorRef } from "./block-note-editor";
import { useFileOperations } from "@/hooks/text-editor/use-file-operations";
import { useContentManager } from "@/hooks/text-editor/use-content-manager";
import { useRouter } from "next/navigation";

// todo: look into this dynamic import performance impact
// Dynamically import BlockNote editor with no SSR
const BlockNoteEditor = dynamic(() => import("./block-note-editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-screen items-center justify-center">
      <div className="text-sm text-muted-foreground">Loading editor...</div>
    </div>
  ),
});

export type TextEditorProps = {
  fileName?: string;
  value?: string;
  showComments?: boolean;
  onToggleComments?: () => void;
  commentCount?: number;
  editorRef?: React.RefObject<BlockNoteEditorRef | null>;
  disabledCondition?: boolean;
  projectId: string;
  nodeId: string;
};

const TextEditor = ({
  fileName = "Untitled.md",
  value = "",
  showComments = false,
  onToggleComments = () => {},
  commentCount = 0,
  editorRef,
  disabledCondition = false,
  projectId,
  nodeId,
}: TextEditorProps) => {
  const {
    focusMode,
    isFullscreen,
    toggleAppFocus,
    toggleBrowserFullscreen,
    exitFocusMode,
  } = useFocusMode();

  const { saveFileMutation, deleteFileMutation } = useFileOperations({
    nodeId,
  });
  const isDeleting = deleteFileMutation.isPending;

  const router = useRouter();

  const handleDelete = async () => {
    await deleteFileMutation.mutateAsync();
    router.push(`/workspace/${projectId}/text-editor`);
    return true;
  };

  const { content, isDirty, updateContent, saveContent, isSaving } =
    useContentManager({
      initialContent: value,
      saveFileMutation: saveFileMutation,
    });

  const [internal, setInternal] = useState(content);
  const internalEditorRef = useRef<BlockNoteEditorRef>(null);
  const effectiveEditorRef = editorRef || internalEditorRef;

  // todo: is this necessary?
  // Keep internal state in sync
  useEffect(() => setInternal(content), [content]);

  const handleContentChange = (content: string) => {
    setInternal(content);
    updateContent(content);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={getContainerClass(focusMode)}
      >
        {/* Header - Always visible but styled differently in focus modes */}
        <div className={getHeaderClass(focusMode)}>
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-muted-foreground" />
              <span className="truncate text-sm font-medium">{fileName}</span>
              {isDirty && (
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  <span className="text-xs text-muted-foreground">Unsaved</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Focus Mode Controls */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleAppFocus}
                  className={cn(
                    "transition-colors cursor-pointer",
                    focusMode === "APP" &&
                      "bg-primary/10 text-primary cursor-pointer",
                  )}
                >
                  <Focus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {focusMode === "APP"
                  ? "Exit App Focus (Cmd/Ctrl + K)"
                  : "App Focus Mode (Cmd/Ctrl + K)"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleBrowserFullscreen}
                  className={cn(
                    "transition-colors cursor-pointer",
                    focusMode === "BROWSER" &&
                      "bg-primary/10 text-primary cursor-pointer",
                  )}
                >
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4" />
                  ) : (
                    <Maximize className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen
                  ? "Exit Fullscreen (Cmd/Ctrl + Shift + F)"
                  : "Browser Fullscreen (Cmd/Ctrl + Shift + F)"}
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleComments}
                  className={cn(
                    "relative transition-colors cursor-pointer",
                    showComments && "bg-primary/10 text-primary",
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                  {commentCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                      {commentCount > 9 ? "9+" : commentCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {showComments ? "Hide comments" : "Show comments"}
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isDirty ? "default" : "outline"}
                  size="sm"
                  onClick={saveContent}
                  disabled={isSaving || !isDirty}
                  className={cn(
                    "gap-2 cursor-pointer",
                    isSaving && "animate-pulse cursor-disabled",
                  )}
                >
                  {isSaving ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : isDirty ? (
                    <Save className="h-3 w-3" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                  {isSaving ? "Saving..." : isDirty ? "Save" : "Saved"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isDirty ? "Save changes (Cmd/Ctrl + S)" : "File is up to date"}
              </TooltipContent>
            </Tooltip>

            {focusMode === "NORMAL" && (
              <Button
                variant="ghost"
                size="icon"
                disabled={disabledCondition || isDeleting}
                onClick={handleDelete}
                className="text-destructive hover:text-destructive cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 min-h-0">
          <BlockNoteEditor
            ref={effectiveEditorRef}
            initialContent={internal}
            onChange={handleContentChange}
            disabledCondition={disabledCondition}
          />
        </div>

        {/* Focus Mode Hint */}
        {focusMode !== "NORMAL" && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-1 rounded text-xs backdrop-blur-sm">
            Press ESC to exit focus mode
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default TextEditor;
