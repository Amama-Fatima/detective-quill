"use client";

import { useEffect, useState, useRef } from "react";
import { TextEditor } from "@/components/editor-workspace/editor/text-editor";
import { CommentsPanel } from "@/components/editor-workspace/comments/comments-panel";
import { NewCommentDialog } from "@/components/editor-workspace/comments/new-comment-dialog";
import { useFileOperations } from "@/hooks/text-editor/use-file-operations";
import { useContentManager } from "@/hooks/text-editor/use-content-manager";
import { useComments } from "@/hooks/use-comments";
import { FileNotFoundState } from "./loading-states";
import { FsNode } from "@detective-quill/shared-types";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import type { BlockNoteEditorRef } from "./block-note-editor";

interface TextEditorContainerProps {
  projectId: string;
  node: FsNode;
  isActive: boolean;
  isOwner: boolean;
}

export function TextEditorContainer({
  projectId,
  node,
  isActive,
  isOwner,
}: TextEditorContainerProps) {
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

  const { saving, saveFile, deleteFile } = useFileOperations({
    projectId,
    initialNode: node,
  });

  const { content, isDirty, updateContent, saveContent } = useContentManager({
    initialContent: node?.content || "",
    autoSaveDelay: 2000,
    onSave: saveFile,
  });

  const {
    stats,
    addComment,
    comments,
    isLoading,
    removeComment,
    editComment,
    toggleResolve,
  } = useComments({
    fsNodeId: node?.id || "",
    includeResolved: true,
    projectId,
  });

  if (!node) {
    return <FileNotFoundState />;
  }

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

  return (
    <div className="flex h-screen w-full">
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
          disabledCondition={!isActive || !isOwner}
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
            <CommentsPanel
              comments={comments}
              isLoading={isLoading}
              stats={stats}
              removeComment={removeComment}
              editComment={editComment}
              toggleResolve={toggleResolve}
            />
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
        addComment={addComment}
        projectId={projectId}
        nodeId={node?.id || ""}
      />
    </div>
  );
}
