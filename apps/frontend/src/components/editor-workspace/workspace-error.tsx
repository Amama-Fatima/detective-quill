import React from "react";

interface WorkspaceErrorProps {
  error: string;
}

export const WorkspaceError: React.FC<WorkspaceErrorProps> = ({ error }) => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </div>
  );
};
