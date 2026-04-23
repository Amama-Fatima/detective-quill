// components/knowledge-graph/knowledge-graph-client.tsx
"use client";

import dynamic from "next/dynamic";
import React, { Suspense, useState } from "react";
import { GraphErrorBoundary } from "@/components/knowledge-graph/graph-error-boundary";
import {
  GraphErrorFallback,
  GraphLoadingFallback,
} from "@/components/knowledge-graph/graph-fallbacks";

const Neo4jGraphVisualization = dynamic(
  () =>
    import("@/components/knowledge-graph/Neo4jNVLVisualization").then(
      (mod) => mod.default,
    ),
  {
    ssr: false,
    loading: () => <GraphLoadingFallback />,
  },
);

type KnowledgeGraphClientProps = {
  /** File id from URL (fs_node_id). Used as scene_id to fetch the KG from Neo4j. */
  fileId?: string | null;
};

export default function KnowledgeGraphClient({
  fileId,
}: KnowledgeGraphClientProps) {
  const [key, setKey] = useState(0);

  const resetGraph = () => setKey((prev) => prev + 1);

  if (fileId == null || fileId === "") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background rounded-lg p-8 text-center">
        <p className="text-sm tracking-[0.25em] uppercase text-muted-foreground font-serif">
          Select a file to view its knowledge graph
        </p>
        <p className="text-xs text-muted-foreground mt-2 max-w-sm">
          Navigate to a file from the workspace or version control and open its
          graph, or use a URL like{" "}
          <code className="text-foreground/80">
            /workspace/[project]/knowledge-graph/[fileId]
          </code>
          .
        </p>
      </div>
    );
  }

  return (
    <GraphErrorBoundary fallback={GraphErrorFallback}>
      <Suspense fallback={<GraphLoadingFallback />}>
        <Neo4jGraphVisualization key={`${key}-${fileId}`} sceneId={fileId} />
      </Suspense>
    </GraphErrorBoundary>
  );
}
