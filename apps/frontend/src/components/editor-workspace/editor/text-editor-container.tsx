"use client";

import { useEffect } from "react";
import { TextEditor } from "@/components/editor-workspace/editor/text-editor";
import { useFileOperations } from "@/hooks/text-editor/use-file-operations";
import { useContentManager } from "@/hooks/text-editor/use-content-manager";
import { FileNotFoundState } from "./loading-states";
import { FsNode } from "@detective-quill/shared-types";

interface TextEditorContainerProps {
  projectId: string;
  node: FsNode;
}

export function TextEditorContainer({
  projectId,
  node,
}: TextEditorContainerProps) {
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // // Loading state
  // if (loading) {
  //   return <FileLoadingState />;
  // }

  // File not found state
  if (!node) {
    return <FileNotFoundState />;
  }

  // Main editor
  return (
    <TextEditor
      fileName={node.name}
      value={content}
      onChange={updateContent}
      onDelete={deleteFile}
      isDirty={isDirty}
      isSaving={saving}
      onSave={saveContent}
    />
  );
}
