import React from "react";
import { cn } from "@/lib/utils/utils";

interface BreadcrumbsProps {
  projectName: string;
  filePath?: string;
}

export default function Breadcrumbs({
  projectName,
  filePath,
}: BreadcrumbsProps) {
  if (!filePath) {
    return (
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <span className="text-foreground font-medium">{projectName}</span>
      </div>
    );
  }

  // Remove leading slash and split the path
  const pathParts = filePath.replace(/^\//, "").split("/");

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      <span className="text-foreground font-medium">{projectName}</span>
      {pathParts.map((part, index) => (
        <React.Fragment key={index}>
          <span>/</span>
          <span
            className={cn(
              index === pathParts.length - 1
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground cursor-pointer",
            )}
          >
            {part}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
