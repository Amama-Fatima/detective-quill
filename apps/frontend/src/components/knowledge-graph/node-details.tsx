"use client";

import { getSceneDescriptionPreview } from "@/lib/utils/graph-utils";

export type NodeDetailsContent = {
  data: { id: string };
  properties: Record<string, unknown>;
  labels?: string[];
};

type NodeDetailsProps = {
  content: NodeDetailsContent;
};

export default function NodeDetails({ content }: NodeDetailsProps) {
  const isSceneNode = content.labels?.includes("Scene");

  if (isSceneNode) {
    return (
      <p className="text-xs font-mono text-muted-foreground break-all">
        <span className="text-foreground">Description:</span>{" "}
        {getSceneDescriptionPreview(content.properties)}
      </p>
    );
  }

  return (
    <>
      <p className="text-xs font-mono text-muted-foreground break-all">
        <span className="text-foreground">ID:</span> {content.data.id}
      </p>
      <p className="text-xs font-mono text-muted-foreground">
        <span className="text-foreground">Labels:</span>{" "}
        {content.labels?.join(", ")}
      </p>
      <div className="pt-2 border-t border-border">
        {Object.entries(content.properties).map(([key, value]) => (
          <p
            key={key}
            className="text-xs font-mono text-muted-foreground break-all"
          >
            <span className="text-foreground">{key}:</span> {String(value)}
          </p>
        ))}
      </div>
    </>
  );
}
