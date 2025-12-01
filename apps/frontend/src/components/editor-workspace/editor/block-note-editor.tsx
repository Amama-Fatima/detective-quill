"use client";

import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";
import { NOTION_STYLES } from "@/constants/editor";
import type { BlockNoteEditor as BlockNoteEditorType } from "@blocknote/core";

interface BlockNoteEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  disabledCondition: boolean;
}

export interface BlockNoteEditorRef {
  getSelection: () => {
    text: string;
    blockId: string;
    startOffset: number;
    endOffset: number;
  } | null;
  highlightText: (
    blockId: string,
    startOffset: number,
    endOffset: number
  ) => void;
  editor: BlockNoteEditorType | null;
}

const BlockNoteEditor = forwardRef<BlockNoteEditorRef, BlockNoteEditorProps>(
  ({ initialContent = "", onChange, disabledCondition }, ref) => {
    const editor = useCreateBlockNote({
      initialContent: initialContent ? JSON.parse(initialContent) : undefined,
    });

    // handle keydown directly (no useEffect) to block typing when disabled
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (!disabledCondition) return;

      // Prevent any typing or editor-handled shortcuts from taking effect.
      // If you want to allow navigation keys (Arrow keys, Home/End, PageUp/Down)
      // you can whitelist them here.
      e.preventDefault();
      e.stopPropagation();
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      getSelection: () => {
        try {
          const selection = editor.getTextCursorPosition();
          const selectedText = editor.getSelectedText();

          if (!selectedText || !selection) return null;

          // Get the block ID and calculate offsets
          const block = selection.block;
          const blockId = block.id;

          // For simplicity, we'll use the text length as offsets
          // In a real implementation, you'd want more precise positioning
          return {
            text: selectedText,
            blockId,
            startOffset: 0, // Simplified - would need more complex logic
            endOffset: selectedText.length,
          };
        } catch (error) {
          console.error("Error getting selection:", error);
          return null;
        }
      },
      highlightText: (
        blockId: string,
        startOffset: number,
        endOffset: number
      ) => {
        try {
          // Find the block and scroll to it
          const blocks = editor.document;
          const block = blocks.find((b) => b.id === blockId);

          if (block) {
            // Scroll to the block
            editor.setTextCursorPosition(block, "start");

            // Add a visual highlight (temporary background color)
            // This is a simplified version - you might want to implement a more sophisticated highlighting
            const blockElement = document.querySelector(
              `[data-id="${blockId}"]`
            );
            if (blockElement) {
              blockElement.classList.add("highlight-comment");
              setTimeout(() => {
                blockElement.classList.remove("highlight-comment");
              }, 3000); // Remove highlight after 3 seconds
            }
          }
        } catch (error) {
          console.error("Error highlighting text:", error);
        }
      },
      editor,
    }));

    // Handle content changes
    useEffect(() => {
      if (!onChange) return;

      const handleChange = async () => {
        if (disabledCondition) return;

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
        <style>{`
          .highlight-comment {
            background-color: rgba(255, 215, 0, 0.3) !important;
            transition: background-color 0.3s ease;
            animation: pulse 0.5s ease-in-out;
          }
          
          @keyframes pulse {
            0%, 100% { background-color: rgba(255, 215, 0, 0.3); }
            50% { background-color: rgba(255, 215, 0, 0.6); }
          }
        `}</style>
        <div
          onKeyDown={handleKeyDown}
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
            theme="light"
            style={{
              flex: 1,
              height: "100%",
              overflow: "hidden",
            }}
          />
        </div>
      </>
    );
  }
);

BlockNoteEditor.displayName = "BlockNoteEditor";

export default BlockNoteEditor;
