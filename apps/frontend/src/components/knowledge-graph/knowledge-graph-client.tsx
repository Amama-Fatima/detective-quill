// components/knowledge-graph/knowledge-graph-client.tsx
"use client";

import dynamic from "next/dynamic";
import React, { Suspense, useState, useEffect } from "react";

function GraphLoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-background rounded-lg">
      <div className="relative">
        <div
          className="w-16 h-16 rounded-full border-2 border-transparent animate-spin border-t-primary border-r-primary/70"
          style={{ animationDuration: "1.2s" }}
        />
        <div
          className="absolute inset-2 w-12 h-12 rounded-full border-2 border-transparent animate-spin border-t-chart-3 border-l-chart-5"
          style={{ animationDuration: "0.8s", animationDirection: "reverse" }}
        />
        <p className="text-sm tracking-[0.25em] uppercase text-muted-foreground font-serif mt-4 text-center">
          Loading graph visualization...
        </p>
      </div>
    </div>
  );
}

function GraphErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-background rounded-lg p-8">
      <div className="text-4xl mb-4 text-destructive">✕</div>
      <p className="text-sm tracking-widest uppercase mb-2 text-destructive font-serif">
        Failed to load graph
      </p>
      <p className="text-xs text-center max-w-sm text-muted-foreground font-mono mb-4">
        {error.message}
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 text-xs uppercase tracking-wider border border-border rounded hover:bg-muted transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ComponentType<{ error: Error; reset: () => void }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback;
      return <Fallback error={this.state.error} reset={this.reset} />;
    }
    return this.props.children;
  }
}

const Neo4jGraphVisualization = dynamic(
  () => import("@/components/knowledge-graph/Neo4jNVLVisualization").then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <GraphLoadingFallback />
  }
);

export default function KnowledgeGraphClient() {
  const [key, setKey] = useState(0);
  
  // Reset graph when key changes
  const resetGraph = () => setKey(prev => prev + 1);

  return (
    <ErrorBoundary fallback={GraphErrorFallback}>
      <Suspense fallback={<GraphLoadingFallback />}>
        <Neo4jGraphVisualization key={key} sceneId="test-graph-001" />
      </Suspense>
    </ErrorBoundary>
  );
}