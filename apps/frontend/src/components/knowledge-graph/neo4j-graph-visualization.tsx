"use client";

import { useEffect, useRef, useState } from "react";

const THEME = {
  background: "#f5f3ef",
  foreground: "#2c2d3a",
  muted: "#5c5d6e",
  border: "#8b8d9e",
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

        const labels: Record<string, any> = {};
        Object.entries(LABEL_COLORS).forEach(([label, color]) => {
          labels[label] = {
            label: "name",
            title_properties: ["name", "role"],
            [NeoVis.NEOVIS_DEFAULT_CONFIG]: {
              color: {
                background: color,
                border: color,
                highlight: { background: color, border: THEME.foreground },
              },
              font: {
                color: THEME.foreground,
                face: "Georgia, serif",
                size: 13,
              },
              borderWidth: 1.5,
              shadow: {
                enabled: true,
                color: color + "40",
                size: 10,
                x: 0,
                y: 0,
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
              size: 18,
              font: {
                color: THEME.foreground,
                face: "Georgia, serif",
                size: 13,
                strokeWidth: 3,
                strokeColor: THEME.background,
              },
              borderWidth: 1.5,
            },
            edges: {
              color: {
                color: THEME.border,
                highlight: THEME.accent,
                hover: THEME.accent,
              },
              font: {
                color: THEME.muted,
                face: "Georgia, serif",
                size: 11,
                strokeWidth: 0,
                align: "middle",
              },
              arrows: {
                to: { enabled: true, scaleFactor: 0.6 },
              },
              smooth: { enabled: true, type: "dynamic" },
              width: 1.2,
            },
            physics: {
              enabled: true,
              barnesHut: {
                gravitationalConstant: -8000,
                centralGravity: 0.3,
                springLength: 120,
                springConstant: 0.04,
                damping: 0.09,
              },
              stabilization: { iterations: 150 },
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
              label: (rel: any) => formatRelType(rel.type ?? ""),
              title_properties: ["description"],
            },
          },
          initialCypher: `
            MATCH (n)-[r]->(m)
            WHERE NOT n:Scene AND NOT m:Scene
            RETURN n, r, m
            LIMIT 500
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
        viz.render();
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
              style={{
                animationDuration: "0.8s",
                animationDirection: "reverse",
              }}
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
                className="w-2.5 h-2.5 rounded-full shrink-0 border border-border"
                style={{ background: color, boxShadow: `0 0 6px ${color}50` }}
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