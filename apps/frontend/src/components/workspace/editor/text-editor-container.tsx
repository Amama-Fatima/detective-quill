"use client";

import { useEffect } from "react";
import { TextEditor } from "@/components/workspace/editor/text-editor";
import { useFileOperations } from "@/hooks/text-editor/use-file-operations";
import { useContentManager } from "@/hooks/text-editor/use-content-manager";
import { FileLoadingState, FileNotFoundState } from "./loading-states";

interface TextEditorContainerProps {
  projectId: string;
  nodeId: string;
}

export function TextEditorContainer({
  projectId,
  nodeId,
}: TextEditorContainerProps) {
  // File operations (load, save, delete)
  const { node, loading, saving, loadFile, saveFile, deleteFile } =
    useFileOperations({ projectId, nodeId });

  // Content management (tracking changes, auto-save)
  const { content, isDirty, updateContent, saveContent } = useContentManager({
    initialContent: node?.content || "",
    autoSaveDelay: 2000,
    onSave: saveFile,
  });

  // Load file when component mounts or nodeId changes
  useEffect(() => {
    loadFile();
  }, [loadFile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Loading state
  if (loading) {
    return <FileLoadingState />;
  }

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
