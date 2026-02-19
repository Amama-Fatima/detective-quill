"use client";

import { useMemo } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import {
  SnapshotTreeNode,
  findSnapshotNode,
} from "@/lib/utils/snapshot-tree-utils";
import { FileText } from "lucide-react";
import { NOTION_STYLES } from "@/constants/editor";

interface SnapshotTextViewerProps {
  snapshots: SnapshotTreeNode[];
  selectedNodeId: string | null;
}

function parseBlockNoteContent(content: string | null): unknown[] | null {
  if (!content) return null;

  const trimmedContent = content.trim();
  if (!trimmedContent.startsWith("[") && !trimmedContent.startsWith("{")) {
    return null;
  }

  try {
    const parsedContent = JSON.parse(trimmedContent) as unknown;

    if (Array.isArray(parsedContent)) {
      return parsedContent;
    }

    if (parsedContent && typeof parsedContent === "object") {
      const objectContent = parsedContent as { blocks?: unknown };
      if (Array.isArray(objectContent.blocks)) {
        return objectContent.blocks;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export default function SnapshotTextViewer({
  snapshots,
  selectedNodeId,
}: SnapshotTextViewerProps) {
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return findSnapshotNode(snapshots, selectedNodeId);
  }, [snapshots, selectedNodeId]);

  const parsedBlockContent = useMemo(
    () => parseBlockNoteContent(selectedNode?.content ?? null),
    [selectedNode?.content],
  );

  const snapshotEditor = useCreateBlockNote(
    {
      initialContent: parsedBlockContent ?? undefined,
    },
    [selectedNode?.id],
  );

  if (!selectedNodeId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Select a file to view its content
          </p>
        </div>
      </div>
    );
  }

  if (!selectedNode) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-destructive">File not found</p>
      </div>
    );
  }

  if (selectedNode.node_type === "folder") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">
          This is a folder. Select a file to view its content.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-card px-6 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-medium">{selectedNode.name}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {parsedBlockContent ? (
          <>
            <style dangerouslySetInnerHTML={{ __html: NOTION_STYLES }} />
            <div className="h-full">
              <BlockNoteView
                editor={snapshotEditor}
                editable={false}
                theme="light"
                style={{
                  flex: 1,
                  height: "100%",
                  overflow: "hidden",
                }}
              />
            </div>
          </>
        ) : (
          <div className="p-6">
            {selectedNode.content ? (
              <pre className="text-sm font-mono whitespace-pre-wrap break-words bg-muted/30 p-4 rounded-lg border">
                {selectedNode.content}
              </pre>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                This file has no content
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
