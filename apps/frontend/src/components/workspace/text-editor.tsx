"use client";

import type React from "react";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  viewMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
};

export function TextEditor({
  fileName = "Untitled.md",
  value = "",
  onChange = () => {},
  onDelete = () => {},
  viewMode: controlledView = "split",
  onViewModeChange = () => {},
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
    if (mod && e.key.toLowerCase() === "b") {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const preview = useMemo(
    () => (
      <ScrollArea className="h-full">
        <article className="prose prose-neutral dark:prose-invert max-w-none px-4 py-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{internal}</ReactMarkdown>
        </article>
      </ScrollArea>
    ),
    [internal]
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium">{fileName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "edit" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("edit")}
                >
                  {"Edit"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit only</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "preview" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("preview")}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  {"Preview"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview only</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === "split" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("split")}
                >
                  <SplitSquareVertical className="mr-1 h-4 w-4" />
                  {"Split"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Side-by-side</TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              aria-label="Delete file"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b px-2 py-1.5">
          <ToolbarButton
            tooltip="Heading 1 (Cmd/Ctrl + 1)"
            onClick={() => applyHeading(1)}
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Heading 2 (Cmd/Ctrl + 2)"
            onClick={() => applyHeading(2)}
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Heading 3 (Cmd/Ctrl + 3)"
            onClick={() => applyHeading(3)}
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton
            tooltip="Bold (Cmd/Ctrl + B)"
            onClick={() => applyInlineWrap("**")}
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Italic (Cmd/Ctrl + I)"
            onClick={() => applyInlineWrap("*")}
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ToolbarButton
            tooltip="Bullet list"
            onClick={() => applyLinePrefix("- ")}
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Numbered list"
            onClick={() => applyLinePrefix("1. ")}
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Blockquote (Cmd/Ctrl + E)"
            onClick={() => applyLinePrefix("> ")}
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            tooltip="Code block (Cmd/Ctrl + K)"
            onClick={applyCodeBlock}
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton tooltip="Horizontal rule" onClick={applyHr}>
            <Minus className="h-4 w-4" />
          </ToolbarButton>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Insert link">
                <LinkIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{"Insert Link"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="link-text">
                    {"Text"}
                  </label>
                  <Input
                    id="link-text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Link text"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="link-url">
                    {"URL"}
                  </label>
                  <Input
                    id="link-url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    const text = linkText.trim() || "link";
                    const url = linkUrl.trim() || "https://";
                    insertAtCursor(`[${text}](${url})`);
                    setLinkText("");
                    setLinkUrl("");
                    setLinkOpen(false);
                  }}
                >
                  {"Insert"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={imageOpen} onOpenChange={setImageOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Insert image">
                <ImageIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{"Insert Image"}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="img-alt">
                    {"Alt"}
                  </label>
                  <Input
                    id="img-alt"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="Alt text"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium" htmlFor="img-url">
                    {"URL"}
                  </label>
                  <Input
                    id="img-url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.png"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    const alt = imageAlt.trim() || "image";
                    const url = imageUrl.trim() || "https://";
                    insertAtCursor(`![${alt}](${url})`);
                    setImageAlt("");
                    setImageUrl("");
                    setImageOpen(false);
                  }}
                >
                  {"Insert"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Content */}
        <div className="flex min-h-0 flex-1">
          {/* Small screens: tabs */}
          <div className="w-full md:hidden">
            <Tabs
              value={viewMode === "preview" ? "preview" : "edit"}
              onValueChange={(v) =>
                setViewMode(v === "preview" ? "preview" : "edit")
              }
              className="h-full"
            >
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="edit" className="rounded-none">
                  {"Edit"}
                </TabsTrigger>
                <TabsTrigger value="preview" className="rounded-none">
                  {"Preview"}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="m-0 h-[calc(100vh-160px)]">
                <EditorArea
                  textareaRef={textareaRef}
                  value={internal}
                  setValue={commit}
                  onKeyDown={onKeyDown}
                />
              </TabsContent>
              <TabsContent
                value="preview"
                className="m-0 h-[calc(100vh-160px)]"
              >
                {preview}
              </TabsContent>
            </Tabs>
          </div>

          {/* md+ screens: split or single pane */}
          <div className="hidden h-[calc(100vh-160px)] w-full md:flex">
            {viewMode !== "preview" && (
              <div
                className={cn(
                  "h-full",
                  viewMode === "split" ? "w-1/2 border-r" : "w-full"
                )}
              >
                <EditorArea
                  textareaRef={textareaRef}
                  value={internal}
                  setValue={commit}
                  onKeyDown={onKeyDown}
                />
              </div>
            )}
            {viewMode !== "edit" && (
              <div
                className={cn(
                  "h-full",
                  viewMode === "split" ? "w-1/2" : "w-full"
                )}
              >
                {preview}
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );

  function insertAtCursor(text: string) {
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
  }
}

function ToolbarButton({
  tooltip,
  onClick,
  children,
}: {
  tooltip: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          aria-label={tooltip}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

function EditorArea({
  textareaRef,
  value,
  setValue,
  onKeyDown,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  setValue: (v: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) {
  // Save on Cmd/Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        // Let parent persistence effect handle save; localStorage update is already debounced by state
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <ScrollArea className="h-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        className="h-[calc(100vh-180px)] w-full resize-none bg-background px-4 py-4 font-mono text-sm outline-none"
        placeholder="# Start typing markdown..."
      />
    </ScrollArea>
  );
}

export default TextEditor;
