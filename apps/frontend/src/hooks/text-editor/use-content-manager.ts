import { useState, useEffect, useCallback } from "react";
import { useFileOperations } from "./use-file-operations";

interface UseContentManagerProps {
  initialContent?: string;
  saveFileMutation: ReturnType<typeof useFileOperations>["saveFileMutation"];
}

export const useContentManager = ({
  initialContent = "",
  saveFileMutation,
}: UseContentManagerProps) => {
  const [content, setContent] = useState(initialContent);
  const [originalContent, setOriginalContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);
  const isSaving = saveFileMutation.isPending;

  // Update content and track changes
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  // Track if content has changed
  useEffect(() => {
    setIsDirty(content !== originalContent);
  }, [content, originalContent]);

  // Update initial content when it changes (e.g., file loaded)
  useEffect(() => {
    if (initialContent !== originalContent) {
      setContent(initialContent);
      setOriginalContent(initialContent);
      setIsDirty(false);
    }
  }, [initialContent, originalContent]);

  // Manual save function
  const saveContent = useCallback(async () => {
    if (!isDirty) return false;

    const success = await saveFileMutation.mutateAsync(content);
    if (success) {
      setOriginalContent(content);
      setIsDirty(false);
    }
    return success;
  }, [content, isDirty]);

  return {
    content,
    isDirty,
    updateContent,
    saveContent,
    isSaving,
  };
};
