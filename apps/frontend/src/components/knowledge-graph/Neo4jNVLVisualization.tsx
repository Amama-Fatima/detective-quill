// components/Neo4jNVLVisualization.tsx
"use client";

import { useEffect, useRef, useState } from 'react';
import { InteractiveNvlWrapper } from '@neo4j-nvl/react';
import { NVL } from '@neo4j-nvl/base';
import { useNeo4jGraphData } from '@/hooks/use-neo4j-graph-data';

const THEME = {
  background: "#f5f3ef",
  foreground: "#2c2d3a",
  muted: "#5c5d6e",
  border: "#8b9d8b",
  primary: "#2d2f3d",
  chart1: "#2d2f3d",
  chart2: "#4a5a7a",
  chart3: "#a67c52",
  chart4: "#4a7a5c",
  chart5: "#b85c4a",
  destructive: "#c94a4a",
  accent: "#6b7aaa",
} as const;

const LABEL_COLORS: Record<string, string> = {
  Character: THEME.chart1,
  Location: THEME.chart3,
  Organisation: THEME.chart2,
  Group: THEME.chart5,
  Scene: THEME.accent,
  Entity: THEME.muted,
};

export default function Neo4jNVLVisualization({ sceneId }: { sceneId?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nvlRef = useRef<NVL>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  
  const { nodes: rawNodes, relationships: rawRels, loading, error } = 
    useNeo4jGraphData(sceneId);

  // Transform nodes to NVL format with your styling
  const nodes = rawNodes.map(node => {
    const primaryLabel = node.labels[0] || 'Entity';
    const color = LABEL_COLORS[primaryLabel] || THEME.muted;
    
    return {
      id: node.id,
      label: node.properties.name || node.properties.scene_id || node.id,
      // NVL styling properties
      color: color,
      size: 28,
      caption: node.properties.name || '',
      // Store all properties for tooltips
      properties: node.properties,
      // Customize tooltip content
      tooltip: () => `
        <div style="font-family: serif;">
          <strong>${node.properties.name || ''}</strong>
          ${node.properties.role ? `<br/>role: ${node.properties.role}` : ''}
          ${node.properties.type ? `<br/>type: ${node.properties.type}` : ''}
          ${node.properties.description ? `<br/><small>${node.properties.description}</small>` : ''}
        </div>
      `
    };
  });

  // Transform relationships to NVL format
  const relationships = rawRels.map(rel => ({
    id: rel.id,
    from: rel.from,
    to: rel.to,
    type: rel.type,
    caption: rel.type.replace(/_/g, ' ').toLowerCase(),
    properties: rel.properties,
    // Style relationships
    color: THEME.border,
    width: 1.5,
    tooltip: () => `
      <div style="font-family: serif;">
        <strong>${rel.type.replace(/_/g, ' ').toLowerCase()}</strong>
        ${rel.properties.description ? `<br/><small>${rel.properties.description}</small>` : ''}
        ${rel.properties.confidence ? `<br/>confidence: ${rel.properties.confidence}` : ''}
      </div>
    `
  }));

  // FIXED: NVL options with correct structure - layout/renderer must be literal types (Layout), not string
  const nvlOptions = {
    initialZoom: 1.2,
    disableTelemetry: true, // Opt out of telemetry
    renderer: 'canvas' as const, // or 'webgl' for larger graphs
    layout: 'forceDirected' as const, // Layout type expects literal, not widened string
    // Layout-specific options go at the root level
    gravitationalConstant: -12000,
    centralGravity: 0.1,
    springLength: 200,
    springConstant: 0.03,
    damping: 0.12,
    minZoom: 0.1,
    maxZoom: 3,
    backgroundColor: THEME.background,
    selection: {
      node: {
        borderColor: THEME.foreground,
        borderWidth: 2
      }
    }
  };

  // Callbacks for interactions
  const mouseEventCallbacks = {
    onNodeClick: (node: any) => {
      console.log('Node clicked:', node);
      // You can add custom behavior here
    },
    onRelationshipClick: (rel: any) => {
      console.log('Relationship clicked:', rel);
    },
    onCanvasClick: () => {
      console.log('Canvas clicked');
    },
    onHover: (element: any) => {
      // Optional hover effects
    },
    onPan: () => {
      // Optional pan tracking
    },
    onZoom: () => {
      // Optional zoom tracking
    }
  };

  useEffect(() => {
    if (loading) {
      setStatus('loading');
    } else if (error) {
      setStatus('error');
      setErrorMsg(error);
    } else if (nodes.length > 0) {
      setStatus('ready');
    }
  }, [loading, error, nodes]);

  if (status === 'error') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background rounded-lg p-8">
        <div className="text-4xl mb-4 text-destructive">✕</div>
        <p className="text-sm tracking-widest uppercase mb-2 text-destructive font-serif">
          Connection failed
        </p>
        <p className="text-xs text-center max-w-sm text-muted-foreground font-mono">
          {errorMsg}
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background rounded-lg">
          <div className="relative mb-6">
            <div
              className="w-16 h-16 rounded-full border-2 border-transparent animate-spin border-t-primary border-r-primary/70"
              style={{ animationDuration: "1.2s" }}
            />
            <div
              className="absolute inset-2 w-12 h-12 rounded-full border-2 border-transparent animate-spin border-t-chart-3 border-l-chart-5"
              style={{ animationDuration: "0.8s", animationDirection: "reverse" }}
            />
          </div>
          <p className="text-sm tracking-[0.25em] uppercase text-muted-foreground font-serif">
            Mapping the web…
          </p>
        </div>
      )}

      {status === 'ready' && (
        <>
          <InteractiveNvlWrapper
            nodes={nodes}
            rels={relationships}
            nvlOptions={nvlOptions}
            mouseEventCallbacks={mouseEventCallbacks}
            ref={nvlRef}
          />

          <div className="absolute bottom-4 left-4 rounded-md px-3 py-2 flex flex-col gap-1.5 bg-card/90 border border-border backdrop-blur-sm shadow-sm">
            <p className="text-[10px] tracking-[0.2em] uppercase mb-1 text-muted-foreground font-serif">
              Entity types
            </p>
            {Object.entries(LABEL_COLORS).map(([label, color]) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <span className="text-xs text-foreground font-serif">{label}</span>
              </div>
            ))}
          </div>

          <div className="absolute top-3 right-3 text-[10px] tracking-widest uppercase px-2 py-1 rounded bg-muted/80 border border-border text-muted-foreground font-serif">
            scroll to zoom · drag to pan · click to select
          </div>
        </>
      )}
    </div>
  );
}