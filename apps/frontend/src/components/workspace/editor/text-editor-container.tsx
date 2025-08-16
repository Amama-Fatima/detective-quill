"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TextEditor } from "@/components/workspace/editor/text-editor";
import { useAuth } from "@/context/auth-context";
import {
  getFsNode,
  updateFsNode,
  deleteFsNode,
} from "@/lib/backend-calls/fs-nodes";
import { UpdateFsNodeDto, FsNodeResponse } from "@detective-quill/shared-types";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";

interface TextEditorContainerProps {
  projectId: string;
  nodeId: string;
}

type FocusMode = "normal" | "app" | "browser";

export function TextEditorContainer({
  projectId,
  nodeId,
}: TextEditorContainerProps) {
  const [node, setNode] = useState<FsNodeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  const { session } = useAuth();
  const router = useRouter();

  // Load specific node
  useEffect(() => {
    const fetchNode = async () => {
      if (!session?.access_token || !nodeId) return;

      setLoading(true);
      try {
        const response = await getFsNode(nodeId, session.access_token);

        if (response.success && response.data) {
          const nodeData = response.data;

          // Check if it's a file (can't edit folders)
          if (nodeData.node_type !== "file") {
            toast.error("Cannot edit folders");
            router.push(`/workspace/${projectId}`);
            return;
          }

          setNode(nodeData);
          const nodeContent = nodeData.content || "";
          setContent(nodeContent);
          setOriginalContent(nodeContent);
          setIsDirty(false);
        } else {
          toast.error("File not found");
          router.push(`/workspace/${projectId}`);
        }
      } catch (error) {
        console.error("Error fetching node:", error);
        toast.error("Failed to load file");
        router.push(`/workspace/${projectId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNode();
  }, [nodeId, session?.access_token, projectId, router]);

  // Track content changes
  useEffect(() => {
    setIsDirty(content !== originalContent);
  }, [content, originalContent]);

  const updateContent = (newContent: string) => {
    setContent(newContent);
  };

  const saveFile = async () => {
    if (!node || !session?.access_token || !isDirty) {
      return;
    }

    setSaving(true);
    try {
      const updateData: UpdateFsNodeDto = {
        content: content,
      };

      const response = await updateFsNode(
        nodeId,
        updateData,
        session.access_token
      );

      if (response.success && response.data) {
        setNode(response.data);
        setOriginalContent(content);
        setIsDirty(false);
        toast.success("File saved successfully");
      } else {
        toast.error(response.error || "Failed to save file");
      }
    } catch (error) {
      console.error("Error saving file:", error);
      toast.error("Failed to save file");
    } finally {
      setSaving(false);
    }
  };

  const deleteFile = async () => {
    if (!node || !session?.access_token) return;

    if (!confirm(`Are you sure you want to delete "${node.name}"?`)) return;

    try {
      const response = await deleteFsNode(nodeId, session.access_token);

      if (response.success) {
        toast.success("File deleted successfully");
        router.push(`/workspace/${projectId}`);
      } else {
        toast.error(response.error || "Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("Failed to delete file");
    }
  };

  const handleFocusModeChange = (mode: FocusMode) => {
    // Handle focus mode changes if needed
    if (mode === "app") {
      document.body.style.overflow = "hidden";
    } else if (mode === "normal") {
      document.body.style.overflow = "";
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Auto-save functionality (optional)
  useEffect(() => {
    if (!isDirty || saving) return;

    const autoSaveTimer = setTimeout(() => {
      saveFile();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [content, isDirty, saving]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading file...</p>
        </div>
      </div>
    );
  }

  if (!node) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-muted p-6">
            <FileText className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">File not found</h2>
            <p className="text-sm text-muted-foreground">
              The file you're looking for doesn't exist or has been deleted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TextEditor
      fileName={node.name}
      value={content}
      onChange={updateContent}
      onDelete={deleteFile}
      isDirty={isDirty}
      isSaving={saving}
      onSave={saveFile}
      onFocusModeChange={handleFocusModeChange}
    />
  );
}
