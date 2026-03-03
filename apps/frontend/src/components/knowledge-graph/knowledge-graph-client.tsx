"use client";

import dynamic from "next/dynamic";

const Neo4jGraphVisualization = dynamic(
  () => import("@/components/knowledge-graph/neo4j-graph-visualization"),
  { ssr: false }
);

export default function KnowledgeGraphClient() {
    return (
    <div className="w-full h-full">
        <Neo4jGraphVisualization />;
    </div>
    ) 
}