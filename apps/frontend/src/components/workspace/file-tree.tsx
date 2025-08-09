"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, MoreHorizontal } from "lucide-react";

export type MarkdownFile = {
  id: string;
  name: string; // must end with .md
  content: string;
  updatedAt: string;
};

export type FileTreeProps = {
  files?: MarkdownFile[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDelete?: (id: string) => void;
};

export function FileTree({
  files = [
    {
      id: "demo",
      name: "Demo.md",
      content: "# Demo",
      updatedAt: new Date().toISOString(),
    },
  ],
  selectedId,
  onSelect = () => {},
  onRename = () => {},
  onDelete = () => {},
}: FileTreeProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const filesSorted = useMemo(
    () => [...files].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    [files]
  );

  return (
    <ul className="p-2">
      {filesSorted.map((f) => (
        <li key={f.id}>
          <div
            className={cn(
              "group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/60",
              selectedId === f.id ? "bg-muted" : "bg-transparent"
            )}
          >
            <button
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              onClick={() => onSelect(f.id)}
              aria-label={`Open ${f.name}`}
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              {renamingId === f.id ? (
                <RenameInline
                  initialName={f.name.replace(/\.md$/i, "")}
                  onCancel={() => setRenamingId(null)}
                  onSubmit={(next) => {
                    const nextName = next.trim() || "Untitled";
                    onRename(
                      f.id,
                      nextName.endsWith(".md") ? nextName : `${nextName}.md`
                    );
                    setRenamingId(null);
                  }}
                />
              ) : (
                <span className="truncate text-sm">{f.name}</span>
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => setRenamingId(f.id)}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(f.id)}
                  className="text-destructive focus:text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </li>
      ))}
    </ul>
  );
}

function RenameInline({
  initialName,
  onSubmit,
  onCancel,
}: {
  initialName: string;
  onSubmit: (name: string) => void;
  onCancel: () => void;
}) {
  const [val, setVal] = useState(initialName);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(val);
      }}
      className="flex items-center gap-1"
    >
      <Input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onSubmit(val)}
        onKeyDown={(e) => {
          if (e.key === "Escape") onCancel();
        }}
        className="h-7 w-[150px]"
      />
      <span className="text-xs text-muted-foreground shrink-0">{".md"}</span>
    </form>
  );
}
