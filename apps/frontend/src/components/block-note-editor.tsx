// components/BlockNoteEditor.tsx
"use client";

import React from "react";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/shadcn/style.css";

const BlockNoteEditor = () => {
  const editor = useCreateBlockNote();
  return <BlockNoteView editor={editor} />;
};

export default BlockNoteEditor;
