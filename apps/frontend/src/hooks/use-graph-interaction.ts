"use client";

import { useState, useMemo } from "react";

export interface DetailsContent {
  type: "node" | "relationship";
  data: any;
  properties?: Record<string, unknown>;
  labels?: string[];
  relType?: string;
}

export function useGraphInteraction() {
  const [detailsContent, setDetailsContent] = useState<DetailsContent | null>(
    null,
  );

  const mouseEventCallbacks = useMemo(
    () => ({
      onNodeClick: (node: any) => {
        setDetailsContent({
          type: "node",
          data: node,
          properties: node.properties,
          labels: node.labels,
        });
      },
      onCanvasClick: () => setDetailsContent(null),
      // Cursor feedback during drag — direct DOM mutation, no state/re-render
      onDragStart: (_nodes: any[], event: MouseEvent) => {
        (event.target as HTMLElement | null)
          ?.closest("canvas")
          ?.style.setProperty("cursor", "grabbing");
      },
      onDragEnd: (_nodes: any[], event: MouseEvent) => {
        (event.target as HTMLElement | null)
          ?.closest("canvas")
          ?.style.removeProperty("cursor");
      },
      onNodeRightClick: (_node: any, _hit: unknown, event: MouseEvent) =>
        event.preventDefault(),
      onCanvasRightClick: (event: MouseEvent) => event.preventDefault(),
    }),
    [],
  );

  const selectedNodeId =
    detailsContent?.type === "node" ? detailsContent.data?.id : null;

  return { selectedNodeId, detailsContent, setDetailsContent, mouseEventCallbacks };
}
