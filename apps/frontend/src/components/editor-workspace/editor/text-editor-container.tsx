"use client";

import { useState, useRef } from "react";
import TextEditor from "@/components/editor-workspace/editor/text-editor";
import CommentsPanel from "@/components/editor-workspace/comments/comments-panel";
import NewCommentDialog from "@/components/editor-workspace/comments/new-comment-dialog";
import { useFileOperations } from "@/hooks/text-editor/use-file-operations";
import { useComments } from "@/hooks/use-comments";
import { FileNotFoundState } from "./loading-states";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import type { BlockNoteEditorRef } from "./block-note-editor";
import { useParams } from "next/navigation";

interface TextEditorContainerProps {
  isActive: boolean;
  isOwner: boolean;
}

export default function TextEditorContainer({
  isActive,
  isOwner,
}: TextEditorContainerProps) {
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
    return <div>Loading file...</div>;
  }

  if (error) {
    return <div>Error loading file: {error.message}</div>;
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
    <div className="flex h-screen w-full">
      <div className={showComments ? "flex-1" : "w-full"}>
        <TextEditor
          fileName={nodeData?.name || ""}
          value={nodeData?.content || ""}
          showComments={showComments}
          onToggleComments={() => setShowComments(!showComments)}
          commentCount={stats?.unresolved || 0}
          editorRef={editorRef}
          disabledCondition={!isActive || !isOwner}
          projectId={projectId}
          nodeId={nodeData?.id || ""}
        />
      </div>

      {showComments && (
        <div className="w-80 flex flex-col h-screen">
          <div className="p-2 border-b flex-shrink-0">
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
          <div className="flex-1 overflow-hidden">
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
