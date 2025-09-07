"use client";

import { useEffect, useState } from "react";
import { TextEditor } from "@/components/editor-workspace/editor/text-editor";
import { useFileOperations } from "@/hooks/text-editor/use-file-operations";
import { useContentManager } from "@/hooks/text-editor/use-content-manager";
import { FileNotFoundState } from "./loading-states";
import { FsNodeResponse } from "@detective-quill/shared-types";
import type { Comment } from "@/components/editor-workspace/editor/block-note-editor";

interface TextEditorContainerProps {
  projectId: string;
  node: FsNodeResponse;
}

// Dummy comments data
const generateDummyComments = (nodeId: string): Comment[] => [
  {
    id: "comment-1",
    blockId: `${nodeId}-block-1`,
    text: "This introduction could be more engaging. Consider starting with a hook or compelling statistic.",
    author: "Sarah Chen",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    resolved: false,
    position: {
      start: 0,
      end: 25,
    },
  },
  {
    id: "comment-2",
    blockId: `${nodeId}-block-2`,
    text: "Great point! This aligns well with our research findings from last quarter.",
    author: "Mike Rodriguez",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    resolved: false,
    position: {
      start: 15,
      end: 40,
    },
  },
  {
    id: "comment-3",
    blockId: `${nodeId}-block-1`,
    text: "We should add a citation here to support this claim.",
    author: "Emma Thompson",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    resolved: false,
    position: {
      start: 50,
      end: 75,
    },
  },
  {
    id: "comment-4",
    blockId: `${nodeId}-block-3`,
    text: "This section was really helpful for understanding the methodology. Thanks for the detailed explanation!",
    author: "Alex Kumar",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    resolved: true,
    position: {
      start: 0,
      end: 30,
    },
  },
  {
    id: "comment-5",
    blockId: `${nodeId}-block-2`,
    text: "Consider breaking this paragraph into smaller chunks for better readability.",
    author: "Jordan Lee",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    resolved: false,
    position: {
      start: 100,
      end: 150,
    },
  },
  {
    id: "comment-6",
    blockId: `${nodeId}-block-4`,
    text: "Love the conclusion! It ties everything together nicely.",
    author: "Taylor Swift",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    resolved: false,
    position: {
      start: 0,
      end: 20,
    },
  },
  {
    id: "comment-7",
    blockId: `${nodeId}-block-1`,
    text: "Fixed the grammar issue mentioned in the review.",
    author: "Current User",
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    resolved: true,
    position: {
      start: 80,
      end: 95,
    },
  },
  {
    id: "comment-8",
    blockId: `${nodeId}-block-3`,
    text: "Should we include more recent data? Some of these statistics are from 2022.",
    author: "Chris Wilson",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    resolved: false,
    position: {
      start: 60,
      end: 90,
    },
  },
];

export function TextEditorContainer({
  projectId,
  node,
}: TextEditorContainerProps) {
  // Initialize comments state with dummy data
  const [comments, setComments] = useState<Comment[]>([]);

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

  // Initialize dummy comments when component mounts
  useEffect(() => {
    if (node?.id) {
      const dummyComments = generateDummyComments(node.id);
      setComments(dummyComments);
    }
  }, [node?.id]);

  // Handle comments changes
  const handleCommentsChange = (newComments: Comment[]) => {
    setComments(newComments);
    // In a real app, you might want to save comments to the backend here
    console.log("Comments updated:", newComments);
  };

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
      comments={comments}
      onCommentsChange={handleCommentsChange}
      currentUser="Current User"
    />
  );
}
