"use client";

import React, { useEffect } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";

// Enhanced Notion-like styling with scrollable editor
const notionStyles = `
  .bn-container {
    height: 100% !important;
    overflow: hidden !important;
  }
  .bn-editor {
    height: 100% !important;
    min-height: 100% !important;
    padding: 2rem !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
  }
  .ProseMirror {
    min-height: calc(100vh - 160px) !important;
    padding-bottom: 50vh !important;
  }
`;

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
    if (onChange) {
      const handleChange = async () => {
        const blocks = editor.document;
        const jsonContent = JSON.stringify(blocks);
        onChange(jsonContent);
      };

      // Listen to document changes
      editor.onEditorContentChange(handleChange);
    }
  }, [editor, onChange]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: notionStyles }} />
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <BlockNoteView
          editor={editor}
          theme="dark"
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
