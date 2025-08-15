"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the editor with no SSR
const BlockNoteEditor = dynamic(
  () => import("./editor-workspace/editor/block-note-editor"),
  {
    ssr: false,
    loading: () => <div>Loading editor...</div>,
  }
);

const Test = () => {
  return <BlockNoteEditor />;
};

export default Test;
