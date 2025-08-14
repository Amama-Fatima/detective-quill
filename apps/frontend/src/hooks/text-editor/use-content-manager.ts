import { useState, useEffect, useCallback } from "react";

interface UseContentManagerProps {
  initialContent?: string;
  autoSaveDelay?: number;
  onSave?: (content: string) => Promise<boolean>;
}

export const useContentManager = ({
  initialContent = "",
  autoSaveDelay = 2000,
  onSave,
}: UseContentManagerProps) => {
  const [content, setContent] = useState(initialContent);
  const [originalContent, setOriginalContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);

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
    if (!isDirty || !onSave) return false;

    const success = await onSave(content);
    if (success) {
      setOriginalContent(content);
      setIsDirty(false);
    }
    return success;
  }, [content, isDirty, onSave]);

  // Auto-save functionality
  useEffect(() => {
    if (!isDirty || !onSave) return;

    const autoSaveTimer = setTimeout(() => {
      saveContent();
    }, autoSaveDelay);

    return () => clearTimeout(autoSaveTimer);
  }, [content, isDirty, autoSaveDelay, saveContent, onSave]);

  return {
    content,
    isDirty,
    updateContent,
    saveContent,
  };
};
