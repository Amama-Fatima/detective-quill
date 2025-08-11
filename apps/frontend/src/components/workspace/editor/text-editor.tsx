"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Save, Check, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import dynamic from "next/dynamic";

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

  // Keep internal state in sync
  useEffect(() => setInternal(value), [value]);

  const handleContentChange = (content: string) => {
    setInternal(content);
    onChange(content);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      onSave();
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className="flex h-screen flex-col bg-background"
        onKeyDown={onKeyDown}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-card/50 flex-shrink-0">
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

            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 min-h-0">
          <BlockNoteEditor
            initialContent={internal}
            onChange={handleContentChange}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
