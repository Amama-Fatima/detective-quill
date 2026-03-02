import React from "react";

interface TextEditorErrorProps {
  error: string;
}

const TextEditorError: React.FC<TextEditorErrorProps> = ({ error }) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </div>
  );
};

export default TextEditorError;
