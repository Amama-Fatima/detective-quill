"use client";

import { useEffect, useState, useRef } from "react";
import { TextEditor } from "@/components/editor-workspace/editor/text-editor";
import { CommentsPanel } from "@/components/editor-workspace/editor/comments-panel";
import { NewCommentDialog } from "@/components/editor-workspace/editor/new-comment-dialog";
import { useFileOperations } from "@/hooks/text-editor/use-file-operations";
import { useContentManager } from "@/hooks/text-editor/use-content-manager";
import { useComments } from "@/hooks/use-comments";
import { FileNotFoundState } from "./loading-states";
import { FsNodeResponse, CommentResponse } from "@detective-quill/shared-types";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import type { BlockNoteEditorRef } from "./block-note-editor";

interface TextEditorContainerProps {
  projectId: string;
  node: FsNodeResponse;
}

export function TextEditorContainer({
  projectId,
  node,
}: TextEditorContainerProps) {
  const { session } = useAuth();
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

  // File operations (load, save, delete)
  const { saving, saveFile, deleteFile } = useFileOperations({
    projectId,
    initialNode: node,
  });

  // Content management (tracking changes, auto-save)
  const { content, isDirty, updateContent, saveContent } = useContentManager({
    initialContent: node?.content || "",
    autoSaveDelay: 2000,
    onSave: saveFile,
  });

  // Comments functionality
  const {
    comments,
    stats,
    isLoading: commentsLoading,
    addComment,
    editComment,
    removeComment,
    toggleResolve,
  } = useComments({
    fsNodeId: node?.id || "",
    includeResolved: true,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // File not found state
  if (!node) {
    return <FileNotFoundState />;
  }

  const handleAddComment = async (
    commentContent: string,
    selectedText?: string
  ) => {
    if (!session?.access_token) return;

    console.log("Creating comment with selection data:", selectionData); // Debug log

    if (selectionData) {
      // Use stored selection data from when dialog was opened
      await addComment({
        block_id: selectionData.blockId,
        start_offset: selectionData.startOffset,
        end_offset: selectionData.endOffset,
        content: commentContent,
        selected_text: selectionData.text,
      });
    } else {
      // Fallback to placeholder values if no selection
      await addComment({
        block_id: "default-block",
        start_offset: 0,
        end_offset: 0,
        content: commentContent,
        selected_text: selectedText || "",
      });
    }

    setSelectedTextForComment("");
    setSelectionData(null);
  };

  const handleOpenNewCommentDialog = () => {
    // Get current selection when opening the dialog
    const selection = editorRef.current?.getSelection();
    console.log("Selection captured:", selection); // Debug log
    if (selection?.text) {
      setSelectedTextForComment(selection.text);
      setSelectionData(selection);
    } else {
      setSelectedTextForComment("");
      setSelectionData(null);
    }
    setShowNewCommentDialog(true);
  };

  const handleCommentClick = (comment: CommentResponse) => {
    // Highlight the text associated with this comment
    if (editorRef.current && comment.block_id) {
      editorRef.current.highlightText(
        comment.block_id,
        comment.start_offset,
        comment.end_offset
      );
    }
  };

  const handleEditComment = async (
    commentId: string,
    commentContent: string
  ) => {
    await editComment(commentId, { content: commentContent });
  };

  const handleDeleteComment = async (commentId: string) => {
    await removeComment(commentId);
  };

  const handleResolveComment = async (
    commentId: string,
    isResolved: boolean
  ) => {
    await toggleResolve(commentId, isResolved);
  };

  // Main editor layout
  return (
    <div className="flex h-full w-full">
      <div className={showComments ? "flex-1" : "w-full"}>
        <TextEditor
          fileName={node.name}
          value={content}
          onChange={updateContent}
          onDelete={deleteFile}
          isDirty={isDirty}
          isSaving={saving}
          onSave={saveContent}
          showComments={showComments}
          onToggleComments={() => setShowComments(!showComments)}
          commentCount={stats?.unresolved || 0}
          editorRef={editorRef}
        />
      </div>

      {showComments && (
        <div className="w-80 flex flex-col">
          <div className="p-2 border-b">
            <Button
              onClick={handleOpenNewCommentDialog}
              size="sm"
              className="w-full gap-2"
            >
              <MessageSquarePlus className="h-4 w-4" />
              New Comment
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <CommentsPanel
              comments={comments}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
              onResolveComment={handleResolveComment}
              onCommentClick={handleCommentClick}
              isLoading={commentsLoading}
            />
          </div>
        </div>
      )}

      <NewCommentDialog
        open={showNewCommentDialog}
        onOpenChange={setShowNewCommentDialog}
        onSubmit={handleAddComment}
        selectedText={selectedTextForComment}
      />
    </div>
  );
}
