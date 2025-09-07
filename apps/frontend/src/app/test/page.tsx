"use client";
import CollaborativeEditor from "@/components/editor-workspace/editor/collaborative-editor";
import React from "react";

const TestPage = () => {
  return (
    <CollaborativeEditor
      roomId="my-document-123"
      userInfo={{
        name: "John Doe",
        color: "#ff6b6b",
      }}
      onChange={(content) => {
        // Optional: Save to your backend
        console.log("Content changed:", content);
      }}
    />
  );
};

export default TestPage;
