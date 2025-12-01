"use client";

import { useEffect, useState } from "react";
import { TextEditor } from "@/components/editor-workspace/editor/text-editor";
import { CommentsPanel } from "@/components/editor-workspace/editor/comments-panel";
import { NewCommentDialog } from "@/components/editor-workspace/editor/new-comment-dialog";
import { useFileOperations } from "@/hooks/text-editor/use-file-operations";
import { useContentManager } from "@/hooks/text-editor/use-content-manager";
import { useComments } from "@/hooks/use-comments";
import { FileNotFoundState } from "./loading-states";
import { FsNodeResponse } from "@detective-quill/shared-types";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";

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

  const handleAddComment = async (commentContent: string) => {
    if (!session?.access_token) return;

    // For now, we'll use placeholder values for block_id and offsets
    // In a full implementation, you'd capture the actual selection in the editor
    await addComment({
      block_id: "default-block",
      start_offset: 0,
      end_offset: 0,
      content: commentContent,
    });
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
        />
      </div>

      {showComments && (
        <div className="w-80 flex flex-col">
          <div className="p-2 border-b">
            <Button
              onClick={() => setShowNewCommentDialog(true)}
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
              isLoading={commentsLoading}
            />
          </div>
        </div>
      )}

      <NewCommentDialog
        open={showNewCommentDialog}
        onOpenChange={setShowNewCommentDialog}
        onSubmit={handleAddComment}
      />
    </div>
  );
}
