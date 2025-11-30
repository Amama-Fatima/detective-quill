"use client";

import React, { useEffect } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { NOTION_STYLES } from "@/constants/editor";

interface BlockNoteEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
}

const BlockNoteEditor: React.FC<BlockNoteEditorProps> = ({
  initialContent = "",
  onChange,
}) => {
  const editor = useCreateBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
  });

  // Handle content changes
  useEffect(() => {
    if (!onChange) return;

    const handleChange = async () => {
      const blocks = editor.document;
      const jsonContent = JSON.stringify(blocks);
      onChange(jsonContent);
    };

    // Listen to document changes
    editor.onEditorContentChange(handleChange);
  }, [editor, onChange]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: NOTION_STYLES }} />
<div
  style={{
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  }}
>
  <style
    dangerouslySetInnerHTML={{
      __html: `
      /* ==== EDITOR COLORS ==== */
      .bn-container {
        --bn-background: oklch(82.273% 0.0265 84.576);
        --bn-surface: oklch(75.366% 0.04502 87.964);
        --bn-border-color: oklch(0.3 0.02 40);
        --bn-color-text: oklch(0.22 0.01 30);
        --bn-color-muted: oklch(0.4 0.02 50);
        --bn-color-accent: oklch(0.75 0.12 80);
      }

      /* ===== FORCE EDITOR TEXT COLOR ===== */
      .bn-editor,
      .bn-editor *,
      .ProseMirror,
      .ProseMirror * {
        color: oklch(0.22 0.01 30) !important;
      }

      /* ===== SLASH MENU CONTAINER ===== */
      .bn-block-menu {
        background: oklch(75.366% 0.04502 87.964) !important;
        border: 1px solid oklch(0.3 0.02 40) !important;
        border-radius: 8px !important;
        max-height: 250px !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        padding: 4px !important;
      }

      /* ===== SLASH MENU ITEMS ===== */
      .bn-block-menu-item {
        background: transparent !important;
        color: oklch(0.22 0.01 30) !important;
        border-radius: 6px !important;
        padding: 6px 10px !important;
      }

      /* ===== ITEM HOVER ===== */
      .bn-block-menu-item:hover,
      .bn-block-menu-item[data-selected="true"] {
        background: oklch(78.823% 0.02677 84.576) !important;
      }
    `,
    }}
  />

  <BlockNoteView
    editor={editor}
    style={{
      flex: 1,
      height: "100%",
      overflow: "hidden",
    }}
  />
</div>

    </>
  );
};

export default BlockNoteEditor;
