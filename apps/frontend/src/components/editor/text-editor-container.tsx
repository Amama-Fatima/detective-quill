"use client";

import { useState, useRef } from "react";
import TextEditor from "@/components/editor/text-editor";
import CommentsPanel from "@/components/comments/comments-panel";
import NewCommentDialog from "@/components/comments/new-comment-dialog";
import { useFileOperations } from "@/hooks/text-editor/use-file-operations";
import { useComments } from "@/hooks/use-comments";
import { useWorkspaceContext } from "@/context/workspace-context";
import { FileNotFoundState } from "./loading-states";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import type { BlockNoteEditorRef } from "./block-note-editor";
import { useParams } from "next/navigation";

export default function TextEditorContainer() {
  const { isActive } = useWorkspaceContext();
  const params = useParams();
  const nodeId = params.nodeId as string;
  const projectId = params.projectId as string;
  const [showComments, setShowComments] = useState(false);
  const [showNewCommentDialog, setShowNewCommentDialog] = useState(false);
  const [selectedTextForComment, setSelectedTextForComment] =
    useState<string>("");
  const [selectionData, setSelectionData] = useState<{
    text: string;
    blockId: string;
    startOffset: number;
    endOffset: number;
  } | null>(null);
  const editorRef = useRef<BlockNoteEditorRef>(null);

  const { nodeData, isLoading, error } = useFileOperations({
    nodeId,
  });

  const { stats } = useComments({
    fsNodeId: nodeData?.id || "",
    includeResolved: true,
    projectId,
  });

  if (isLoading) {
    return (
      <div className="mx-3 mt-3 flex h-[calc(100vh-9rem)] items-center justify-center rounded-3xl border bg-card/70 text-sm text-muted-foreground shadow-sm">
        Loading file...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-3 mt-3 flex h-[calc(100vh-9rem)] items-center justify-center rounded-3xl border border-destructive/30 bg-destructive/10 px-6 text-sm text-destructive shadow-sm">
        Error loading file: {error.message}
      </div>
    );
  }

  if (!nodeData) {
    return <FileNotFoundState />;
  }

  const handleOpenNewCommentDialog = () => {
    // Get current selection when opening the dialog
    const selection = editorRef.current?.getSelection();
    if (selection?.text) {
      setSelectedTextForComment(selection.text);
      setSelectionData(selection);
    } else {
      setSelectedTextForComment("");
      setSelectionData(null);
    }
    setShowNewCommentDialog(true);
  };

  // todo: bring the action buttons outside the text editor and into this container
  return (
    <div className="mx-3 my-3 flex gap-3 ">
      <div className={showComments ? "flex-1" : "w-full"}>
        <TextEditor
          fileName={nodeData?.name || ""}
          value={nodeData?.content || ""}
          showComments={showComments}
          onToggleComments={() => setShowComments(!showComments)}
          commentCount={stats?.unresolved || 0}
          editorRef={editorRef}
          projectId={projectId}
          nodeId={nodeData?.id || ""}
        />
      </div>

      {showComments && (
        <div className="flex h-full w-80 flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/70 shadow-sm">
          <div className="shrink-0 border-b border-border/70 p-3">
            <Button
              onClick={handleOpenNewCommentDialog}
              disabled={!isActive}
              size="sm"
              className="w-full gap-2 cursor-pointer"
            >
              <MessageSquarePlus className="h-4 w-4" />
              New Comment
            </Button>
          </div>
          <div className="flex-1 overflow-hidden bg-background/40">
            <CommentsPanel />
          </div>
        </div>
      )}

      <NewCommentDialog
        open={showNewCommentDialog}
        onOpenChange={setShowNewCommentDialog}
        selectedText={selectedTextForComment}
        selectionData={selectionData}
        setSelectedTextForComment={setSelectedTextForComment}
        setSelectionData={setSelectionData}
        setShowNewCommentDialog={setShowNewCommentDialog}
        projectId={projectId}
        nodeId={nodeData?.id || ""}
      />
    </div>
  );
}
