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
      <div className="w-full h-full flex flex-col items-center justify-center rounded-lg p-8 text-center">
        <h2 className="noir-text font-bold capitalize text-primary text-[1.1rem] ">
          Select a file to view its knowledge graph
        </h2>
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
