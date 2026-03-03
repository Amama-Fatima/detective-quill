"use client";

import { useEffect, useRef, useState } from "react";

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
  Scene: THEME.accent, // Added Scene
  Entity: THEME.muted,
};

function formatRelType(type: string): string {
  return type.replace(/_/g, " ").toLowerCase();
}

export default function Neo4jGraphVisualization() {
  const containerRef = useRef<HTMLDivElement>(null);
  const vizRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function initViz() {
      if (!containerRef.current) return;

      try {
        const neovisModule = await import("neovis.js");
        const NeoVis = neovisModule.default;
        const { NeoVisEvents } = neovisModule;

        if (cancelled) return;

        const rawUrl = process.env.NEXT_PUBLIC_NEO4J_BOLT_URL ?? "";
        const serverUrl = rawUrl
          .replace("neo4j+s://", "neo4j://")
          .replace("bolt+s://", "bolt://");
        const NEO4J_USER = process.env.NEXT_PUBLIC_NEO4J_USER ?? "";
        const NEO4J_PASSWORD = process.env.NEXT_PUBLIC_NEO4J_PASSWORD ?? "";

        // Per-label node styling
        const labels: Record<string, any> = {};
        Object.entries(LABEL_COLORS).forEach(([labelName, color]) => {
          labels[labelName] = {
            label: "name",
            [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
              function: {
                title: (node: any) =>
                  `${node.properties?.name ?? ""}${node.properties?.role ? ` · ${node.properties.role}` : ""}`,
              },
              static: {
                shape: "dot",
                size: 28,
                color: {
                  background: color,
                  border: color,
                  highlight: { background: color, border: THEME.foreground },
                  hover: { background: color, border: THEME.foreground },
                },
                font: {
                  color: THEME.foreground,
                  size: 14,
                  strokeWidth: 3,
                  strokeColor: THEME.background,
                },
                borderWidth: 2,
                widthConstraint: { maximum: 150 },
              },
            },
          };
        });

        const config = {
          containerId: containerRef.current.id,
          neo4j: {
            serverUrl,
            serverUser: NEO4J_USER,
            serverPassword: NEO4J_PASSWORD,
            driverConfig: {
              encrypted: "ENCRYPTION_ON",
              trust: "TRUST_SYSTEM_CA_SIGNED_CERTIFICATES",
            },
          },
          visConfig: {
            nodes: {
              shape: "dot",
              size: 28,
              font: {
                color: THEME.foreground,
                size: 14,
                strokeWidth: 3,
                strokeColor: THEME.background,
              },
              borderWidth: 2,
            },
            edges: {
              color: {
                color: THEME.border,
                highlight: THEME.accent,
                hover: THEME.accent,
                inherit: false,
              },
              font: {
                color: THEME.muted,
                size: 11,
                strokeWidth: 0,
                align: "middle",
              },
              arrows: { to: { enabled: true, scaleFactor: 0.6 } },
              smooth: { enabled: true, type: "dynamic" },
              width: 1.5,
            },
            physics: {
              enabled: true,
              barnesHut: {
                gravitationalConstant: -12000,
                centralGravity: 0.1,
                springLength: 200,
                springConstant: 0.03,
                damping: 0.12,
              },
              stabilization: { iterations: 200 },
            },
            interaction: {
              hover: true,
              tooltipDelay: 200,
              zoomView: true,
              dragView: true,
            },
          },
          labels,
          relationships: {
            [NeoVis.NEOVIS_DEFAULT_CONFIG]: {
              label: "type",
              [NeoVis.NEOVIS_ADVANCED_CONFIG]: {
                function: {
                  label: (rel: any) => formatRelType(rel.type ?? ""),
                  title: (rel: any) => rel.properties?.description ?? rel.type ?? "",
                },
                static: {
                  font: {
                    color: THEME.muted,
                    size: 10,
                    strokeWidth: 0,
                    align: "middle",
                  },
                  color: {
                    color: THEME.border,
                    highlight: THEME.accent,
                    hover: THEME.accent,
                    inherit: false,
                  },
                  arrows: { to: { enabled: true, scaleFactor: 0.5 } },
                  width: 1.5,
                },
              },
            },
          },
          initialCypher: `
            // CRITICAL FIX: Collect all unique nodes and relationships
            // First, get all scenes (your central nodes)
            MATCH (s:Scene)
            WHERE s.scene_id = 'test-graph-001'  // Filter to your specific graph
            
            // Get all nodes connected to these scenes
            OPTIONAL MATCH (s)<-[:APPEARS_IN]-(entities)
            OPTIONAL MATCH (s)-[:APPEARS_IN]->(otherScenes)
            
            // Get all relationships between entities (like CONFRONTED, WORKING_WITH, ESCAPED)
            OPTIONAL MATCH (entities)-[r]-(otherEntities)
            WHERE r.type IS NOT NULL AND r.type IN ['CONFRONTED', 'WORKING_WITH', 'ESCAPED']
            
            // Collect all unique nodes and relationships
            WITH COLLECT(DISTINCT s) + COLLECT(DISTINCT entities) + COLLECT(DISTINCT otherEntities) + COLLECT(DISTINCT otherScenes) as allNodes,
                 COLLECT(DISTINCT r) as allRels
            
            // Unwind and return all unique paths
            UNWIND allNodes as node
            OPTIONAL MATCH (node)-[rel]-(connected)
            WHERE rel IN allRels OR rel.type IN ['APPEARS_IN', 'CONFRONTED', 'WORKING_WITH', 'ESCAPED']
            RETURN node, rel, connected
          `,
        };

        const viz = new NeoVis(config as any);

        viz.registerOnEvent(NeoVisEvents.CompletionEvent, () => {
          if (!cancelled) setStatus("ready");
        });

        viz.registerOnEvent(NeoVisEvents.ErrorEvent, (err: any) => {
          if (!cancelled) {
            setStatus("error");
            setErrorMsg(String(err?.message ?? err ?? "Unknown error"));
          }
        });

        vizRef.current = viz;
        
        // Debug interceptor
        (viz as any)._query = async (...args: any[]) => {
          console.log("📡 NeoVis query args:", args);
        };
        
        viz.render();
        
        viz.registerOnEvent(NeoVisEvents.CompletionEvent, () => {
          if (!cancelled) {
            setStatus("ready");
            
            // Log network stats for debugging
            const network = (viz as any)._network;
            const nodes = (viz as any)._nodes;
            const edges = (viz as any)._edges;
            
            console.group("🔍 NeoVis Debug");
            console.log("Total nodes:", nodes?.length ?? nodes?.getIds?.()?.length ?? "unknown");
            console.log("Total edges:", edges?.length ?? edges?.getIds?.()?.length ?? "unknown");
            console.log("Nodes:", nodes?.get?.() ?? nodes);
            console.log("Edges:", edges?.get?.() ?? edges);
            console.groupEnd();
          }
        });
      } catch (err: any) {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg(err?.message ?? "Failed to load NeoVis.js");
        }
      }
    }

    initViz();

    return () => {
      cancelled = true;
      vizRef.current?.clearNetwork?.();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        id="neovis-graph-container"
        ref={containerRef}
        className="w-full h-full rounded-lg overflow-hidden bg-background border border-border"
      />

      {status === "loading" && (
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

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background rounded-lg p-8">
          <div className="text-4xl mb-4 text-destructive">✕</div>
          <p className="text-sm tracking-widest uppercase mb-2 text-destructive font-serif">
            Connection failed
          </p>
          <p className="text-xs text-center max-w-sm text-muted-foreground font-mono">
            {errorMsg}
          </p>
        </div>
      )}

      {status === "ready" && (
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
      )}

      {status === "ready" && (
        <div className="absolute top-3 right-3 text-[10px] tracking-widest uppercase px-2 py-1 rounded bg-muted/80 border border-border text-muted-foreground font-serif">
          scroll to zoom · drag to pan
        </div>
      )}
    </div>
  );
}