"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
import { useKeyboardShortcuts } from "@/hooks/text-editor/use-keyboard-shortcuts";

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
  onChange?: (next: string) => void;
  onDelete?: () => void;
  onSave?: () => void;
  isDirty?: boolean;
  isSaving?: boolean;
};

export function TextEditor({
  fileName = "Untitled.md",
  value = "",
  onChange = () => {},
  onDelete = () => {},
  onSave = () => {},
  isDirty = false,
  isSaving = false,
}: TextEditorProps) {
  const [internal, setInternal] = useState(value);

  // Custom hooks - now using Zustand for global state
  const {
    focusMode,
    isFullscreen,
    toggleAppFocus,
    toggleBrowserFullscreen,
    exitFocusMode,
  } = useFocusMode();

  const { handleKeyDown } = useKeyboardShortcuts({
    onSave,
  });

  // Keep internal state in sync
  useEffect(() => setInternal(value), [value]);

  const handleContentChange = (content: string) => {
    setInternal(content);
    onChange(content);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className={getContainerClass(focusMode)} onKeyDown={handleKeyDown}>
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
                    "transition-colors",
                    focusMode === "APP" && "bg-primary/10 text-primary"
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
                    "transition-colors",
                    focusMode === "BROWSER" && "bg-primary/10 text-primary"
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
                  variant={isDirty ? "default" : "outline"}
                  size="sm"
                  onClick={onSave}
                  disabled={isSaving || !isDirty}
                  className={cn("gap-2", isSaving && "animate-pulse")}
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
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 min-h-0">
          <BlockNoteEditor
            initialContent={internal}
            onChange={handleContentChange}
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
}
