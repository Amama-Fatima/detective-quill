"use client";

import type React from "react";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  LinkIcon,
  ImageIcon,
  Minus,
  Eye,
  SplitSquareVertical,
  Trash2,
  Save,
  Check,
  Edit3,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type ViewMode = "edit" | "preview" | "split";

export type TextEditorProps = {
  fileName?: string;
  value?: string;
  onChange?: (next: string) => void;
  onDelete?: () => void;
  onSave?: () => void;
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
  isDirty?: boolean;
  isSaving?: boolean;
};

export function TextEditor({
  fileName = "Untitled.md",
  value = "",
  onChange = () => {},
  onDelete = () => {},
  onSave = () => {},
  viewMode: controlledView = "split",
  onViewModeChange = () => {},
  isDirty = false,
  isSaving = false,
}: TextEditorProps) {
  const [internal, setInternal] = useState(value);
  const [viewMode, setViewMode] = useState<ViewMode>(controlledView);
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // keep internal state in sync
  useEffect(() => setInternal(value), [value]);
  useEffect(() => setViewMode(controlledView), [controlledView]);

  const commit = (next: string) => {
    setInternal(next);
    onChange(next);
  };

  const applyInlineWrap = useCallback((before: string, after = before) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd } = el;
    const selected = el.value.slice(selectionStart, selectionEnd);
    const next =
      el.value.slice(0, selectionStart) +
      before +
      selected +
      after +
      el.value.slice(selectionEnd);
    commit(next);
    const cursor = selectionStart + before.length + selected.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(cursor, cursor);
    });
  }, []);

  const applyLinePrefix = useCallback((prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value: val } = el;
    const startLine = val.lastIndexOf("\n", selectionStart - 1) + 1;
    const endLine = val.indexOf("\n", selectionEnd);
    const end = endLine === -1 ? val.length : endLine;

    const block = val.slice(startLine, end);
    const lines = block.split("\n");
    const transformed = lines
      .map((line, idx) => {
        if (prefix === "1. ") {
          return `${idx + 1}. ${line.replace(/^\d+\.\s+/, "")}`;
        }
        // prevent duplicate bullets
        if (prefix === "- " && line.startsWith("- ")) return line;
        if (prefix === "> " && line.startsWith("> ")) return line;
        return `${prefix}${line.replace(/^(-\s|\d+\.\s|>\s)/, "")}`;
      })
      .join("\n");

    const next = val.slice(0, startLine) + transformed + val.slice(end);
    commit(next);

    requestAnimationFrame(() => {
      el.focus();
      // keep selection roughly where it was
      el.setSelectionRange(startLine, startLine + transformed.length);
    });
  }, []);

  const applyHeading = useCallback((level: 1 | 2 | 3) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, value: val } = el;
    const startLine = val.lastIndexOf("\n", selectionStart - 1) + 1;
    const lineEnd = val.indexOf("\n", startLine);
    const end = lineEnd === -1 ? val.length : lineEnd;
    const line = val.slice(startLine, end).replace(/^#{1,6}\s*/, "");
    const prefix = "#".repeat(level) + " ";
    const next = val.slice(0, startLine) + prefix + line + val.slice(end);
    commit(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        startLine + prefix.length,
        startLine + prefix.length + line.length
      );
    });
  }, []);

  const applyCodeBlock = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value: val } = el;
    const selected = val.slice(selectionStart, selectionEnd);
    const fenced = "```\n" + (selected || "code") + "\n```";
    const next =
      val.slice(0, selectionStart) + fenced + val.slice(selectionEnd);
    commit(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = selectionStart + fenced.length;
      el.setSelectionRange(pos, pos);
    });
  }, []);

  const applyHr = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, value: val } = el;
    const next =
      val.slice(0, selectionStart) + "\n\n---\n\n" + val.slice(selectionStart);
    commit(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = selectionStart + 6;
      el.setSelectionRange(pos, pos);
    });
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && e.key.toLowerCase() === "s") {
      e.preventDefault();
      onSave();
    } else if (mod && e.key.toLowerCase() === "b") {
      e.preventDefault();
      applyInlineWrap("**");
    } else if (mod && e.key.toLowerCase() === "i") {
      e.preventDefault();
      applyInlineWrap("*");
    } else if (mod && e.key.toLowerCase() === "1") {
      e.preventDefault();
      applyHeading(1);
    } else if (mod && e.key.toLowerCase() === "2") {
      e.preventDefault();
      applyHeading(2);
    } else if (mod && e.key.toLowerCase() === "3") {
      e.preventDefault();
      applyHeading(3);
    } else if (mod && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setLinkOpen(true);
    } else if (mod && e.key.toLowerCase() === "e") {
      e.preventDefault();
      applyLinePrefix("> ");
    } else if (mod && e.key.toLowerCase() === "k") {
      e.preventDefault();
      applyCodeBlock();
    }
  };

  // propagate controlled view mode changes
  useEffect(() => {
    onViewModeChange(viewMode);
  }, [viewMode, onViewModeChange]);

  const preview = useMemo(
    () => (
      <ScrollArea className="h-full">
        <article className="prose prose-neutral dark:prose-invert max-w-none px-6 py-6">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{internal}</ReactMarkdown>
        </article>
      </ScrollArea>
    ),
    [internal]
  );

  const insertAtCursor = (text: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value: val } = el;
    const next = val.slice(0, selectionStart) + text + val.slice(selectionEnd);
    commit(next);
    requestAnimationFrame(() => {
      el.focus();
      const pos = selectionStart + text.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const insertLink = () => {
    const linkMarkdown = `[${linkText}](${linkUrl})`;
    insertAtCursor(linkMarkdown);
    setLinkOpen(false);
    setLinkText("");
    setLinkUrl("");
  };

  const insertImage = () => {
    const imageMarkdown = `![${imageAlt}](${imageUrl})`;
    insertAtCursor(imageMarkdown);
    setImageOpen(false);
    setImageAlt("");
    setImageUrl("");
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-full flex-col bg-background">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3 bg-card/50">
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
            <div className="flex items-center gap-1 bg-muted rounded-md p-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "edit" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("edit")}
                    className="h-8"
                  >
                    Edit
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit only</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "preview" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("preview")}
                    className="h-8"
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    Preview
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview only</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={viewMode === "split" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("split")}
                    className="h-8"
                  >
                    <SplitSquareVertical className="mr-1 h-3 w-3" />
                    Split
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Side-by-side</TooltipContent>
              </Tooltip>
            </div>

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

        {/* Toolbar */}
        <div className="border-b bg-card/30 px-4 py-2">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyInlineWrap("**")}
                  className="h-8 w-8 p-0"
                >
                  <Bold className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bold (Ctrl+B)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyInlineWrap("*")}
                  className="h-8 w-8 p-0"
                >
                  <Italic className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Italic (Ctrl+I)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-2 h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyHeading(1)}
                  className="h-8 w-8 p-0"
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 1 (Ctrl+1)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyHeading(2)}
                  className="h-8 w-8 p-0"
                >
                  <Heading2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 2 (Ctrl+2)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyHeading(3)}
                  className="h-8 w-8 p-0"
                >
                  <Heading3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 3 (Ctrl+3)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-2 h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyLinePrefix("- ")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Bullet List</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyLinePrefix("1. ")}
                  className="h-8 w-8 p-0"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Numbered List</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyLinePrefix("> ")}
                  className="h-8 w-8 p-0"
                >
                  <Quote className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Quote (Ctrl+E)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-2 h-6" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => applyInlineWrap("`")}
                  className="h-8 w-8 p-0"
                >
                  <Code className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Inline Code</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={applyCodeBlock}
                  className="h-8 w-8 p-0"
                >
                  <Code className="h-4 w-4" />
                  <span className="sr-only">Code Block</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Code Block (Ctrl+K)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="mx-2 h-6" />

            <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
              <DialogTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Insert Link (Ctrl+L)</TooltipContent>
                </Tooltip>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insert Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Link Text</label>
                    <Input
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="Display text"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">URL</label>
                    <Input
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setLinkOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={insertLink} disabled={!linkText || !linkUrl}>
                    Insert Link
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={imageOpen} onOpenChange={setImageOpen}>
              <DialogTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Insert Image</TooltipContent>
                </Tooltip>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Insert Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Alt Text</label>
                    <Input
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="Image description"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Image URL</label>
                    <Input
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setImageOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={insertImage} disabled={!imageUrl}>
                    Insert Image
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={applyHr}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Horizontal Rule</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 flex overflow-hidden">
          {viewMode === "edit" && (
            <div className="flex-1 flex flex-col">
              <textarea
                ref={textareaRef}
                value={internal}
                onChange={(e) => commit(e.target.value)}
                onKeyDown={onKeyDown}
                className="flex-1 resize-none border-0 bg-transparent p-6 font-mono text-sm leading-relaxed focus:outline-none focus:ring-0"
                placeholder="Start writing your markdown..."
              />
            </div>
          )}

          {viewMode === "preview" && <div className="flex-1">{preview}</div>}

          {viewMode === "split" && (
            <>
              <div className="flex-1 flex flex-col border-r">
                <textarea
                  ref={textareaRef}
                  value={internal}
                  onChange={(e) => commit(e.target.value)}
                  onKeyDown={onKeyDown}
                  className="flex-1 resize-none border-0 bg-transparent p-6 font-mono text-sm leading-relaxed focus:outline-none focus:ring-0"
                  placeholder="Start writing your markdown..."
                />
              </div>
              <div className="flex-1">{preview}</div>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
