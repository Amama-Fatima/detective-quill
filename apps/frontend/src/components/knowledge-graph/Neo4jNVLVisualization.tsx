// @ts-nocheck
"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { InteractiveNvlWrapper } from "@neo4j-nvl/react";
import { NVL } from "@neo4j-nvl/base";
import { useNeo4jGraphData } from "@/hooks/use-neo4j-graph-data";
import { useGraphInteraction } from "@/hooks/use-graph-interaction";
import { getSceneDescriptionPreview, THEME } from "@/lib/utils/graph-utils";
import { getNodeVisualConfig, getEntityType, NODE_TYPE_CONFIGS } from "@/lib/utils/node-type-config";
import { GraphLegend } from "./graph-legend";
import { GraphDetailsPanel } from "./graph-details-panel";
import { Button } from "../ui/button";

const NVL_OPTIONS = {
  initialZoom: 1.2,
  disableTelemetry: true,
  renderer: "canvas" as const,
  layout: "forceDirected" as const,
  gravitationalConstant: -12000,
  centralGravity: 0.1,
  springLength: 200,
  springConstant: 0.03,
  damping: 0.12,
  minZoom: 0.1,
  maxZoom: 3,
  backgroundColor: THEME.background,
  selection: {
    node: { borderColor: THEME.foreground, borderWidth: 3 },
    relationship: { color: THEME.accent, width: 3 },
  },
  physics: {
    enabled: true,
    stabilization: true,
    adaptiveTimestep: true,
  },
  interaction: {
    dragNodes: true,
    dragView: true,
    zoomView: true,
    hover: true,
    hoverDelay: 100,
    selectable: true,
    selectableEdges: false,
  },
};

export default function Neo4jNVLVisualization({ sceneId }: { sceneId?: string }) {
  const nvlRef = useRef<NVL>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const { nodes: rawNodes, relationships: rawRels, loading, error } = useNeo4jGraphData(sceneId);
  const { selectedNodeId, detailsContent, setDetailsContent, mouseEventCallbacks } =
    useGraphInteraction();

  const COLLAPSED_SCENE_ID = "__collapsed_scene__";
  const { collapsedNodes, collapsedRels } = useMemo(() => {
    const sceneNodeIds = new Set<string>();
    const sceneNodes: typeof rawNodes = [];
    const nonSceneNodes: typeof rawNodes = [];

    for (const node of rawNodes) {
      if (getEntityType(node.labels, node.properties) === "Scene") {
        sceneNodeIds.add(node.id);
        sceneNodes.push(node);
      } else {
        nonSceneNodes.push(node);
      }
    }

    if (sceneNodes.length === 0) {
      return { collapsedNodes: rawNodes, collapsedRels: rawRels };
    }

    const primaryScene =
      sceneNodes.find((n) => n.properties.scene_id === sceneId) ?? sceneNodes[0];

    const collapsedSceneNode = {
      ...primaryScene,
      id: COLLAPSED_SCENE_ID,
      properties: {
        ...primaryScene.properties,
        scene_id:
          sceneNodes.length > 1
            ? `${primaryScene.properties.scene_id} +${sceneNodes.length - 1}`
            : primaryScene.properties.scene_id,
      },
    };

    const seen = new Set<string>();
    const newRels: typeof rawRels = [];

    for (const rel of rawRels) {
      const fromIsScene = sceneNodeIds.has(rel.from);
      const toIsScene = sceneNodeIds.has(rel.to);

      if (fromIsScene && toIsScene) continue;

      const newFrom = fromIsScene ? COLLAPSED_SCENE_ID : rel.from;
      const newTo = toIsScene ? COLLAPSED_SCENE_ID : rel.to;

      const key = `${newFrom}|${rel.type}|${newTo}`;
      if (seen.has(key)) continue;
      seen.add(key);

      newRels.push({ ...rel, from: newFrom, to: newTo });
    }

    return {
      collapsedNodes: [collapsedSceneNode, ...nonSceneNodes],
      collapsedRels: newRels,
    };
  }, [rawNodes, rawRels, sceneId]);

  // Only recompute when raw data or selection changes — not on every render
  const nodes = useMemo(
    () =>
      collapsedNodes.map((node) => {
        const isSelected = selectedNodeId === node.id;
        const entityType = getEntityType(node.labels, node.properties);
        const isSceneNode = entityType === "Scene";
        const visual = getNodeVisualConfig(node.labels, node.properties, isSelected);
        const displayName = NODE_TYPE_CONFIGS[entityType].displayName;
        const tooltipDescription = isSceneNode
          ? getSceneDescriptionPreview(node.properties)
          : (node.properties.description as string | undefined);

        return {
          id: node.id,
          label: node.properties.name || node.properties.scene_id || node.id,
          caption: isSceneNode ? (node.properties.scene_id as string) || "" : "",
          properties: node.properties,
          labels: node.labels,
          color: visual.color,
          icon: visual.icon,
          size: visual.size,
          borderColor: visual.borderColor,
          borderWidth: visual.borderWidth,
          captionAlign: visual.captionAlign,
          captionSize: visual.captionSize,
          tooltip: () => `
            <div style="font-family: serif; padding: 8px; max-width: 260px;">
              <div style="font-weight: bold; border-bottom: 1px solid ${THEME.border}; margin-bottom: 6px; padding-bottom: 4px; color: ${THEME.foreground};">
                ${node.properties.name || node.properties.scene_id || "Unnamed"}
              </div>
              <div style="color: ${visual.color}; font-size: 11px; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.1em;">
                ${displayName}
              </div>
              ${
                isSceneNode
                  ? `<div style="color: ${THEME.muted}; font-size: 12px;"><strong>Description:</strong> ${tooltipDescription || "—"}</div>`
                  : `${node.properties.role ? `<div style="font-size: 12px;"><strong>Role:</strong> ${node.properties.role}</div>` : ""}
              ${tooltipDescription ? `<div style="margin-top: 6px; font-size: 12px; color: ${THEME.muted};"><strong>Description:</strong><br/>${tooltipDescription}</div>` : ""}`
              }
            </div>
          `,
        };
      }),
    [collapsedNodes, selectedNodeId],
  );

  const relationships = useMemo(
    () =>
      collapsedRels.map((rel) => ({
        id: rel.id,
        from: rel.from,
        to: rel.to,
        type: rel.type,
        caption: rel.type.replace(/_/g, " ").toLowerCase(),
        properties: rel.properties,
        color: THEME.border,
        width: 1.5,
        tooltip: () => `
          <div style="font-family: serif; padding: 8px; max-width: 250px;">
            <div style="font-weight: bold; border-bottom: 1px solid ${THEME.border}; margin-bottom: 6px; padding-bottom: 4px;">
              ${rel.type.replace(/_/g, " ").toLowerCase()}
            </div>
            ${rel.properties.description ? `<div><strong>Description:</strong> ${rel.properties.description}</div>` : ""}
            ${rel.properties.confidence ? `<div><strong>Confidence:</strong> ${(rel.properties.confidence * 100).toFixed(0)}%</div>` : ""}
            ${rel.properties.scene_id ? `<div><strong>Scene:</strong> ${rel.properties.scene_id}</div>` : ""}
          </div>
        `,
      })),
    [collapsedRels],
  );

  useEffect(() => {
    if (loading) setStatus("loading");
    else if (error) {
      setStatus("error");
      setErrorMsg(error);
    } else if (nodes.length > 0) {
      setStatus("ready");
    }
  }, [loading, error, nodes.length]);

  if (status === "error") {
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
    <div className="relative w-full h-[90vh]">
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background rounded-lg">
          <p className="text-sm tracking-[0.25em] uppercase text-muted-foreground font-serif">
            Loading...
          </p>
        </div>
      )}

      {status === "ready" && (
        <>
          <InteractiveNvlWrapper
            nodes={nodes}
            rels={relationships}
            nvlOptions={NVL_OPTIONS}
            mouseEventCallbacks={mouseEventCallbacks}
            ref={nvlRef}
          />

          <div className="absolute top-3 left-3 flex gap-1">
            <Button
              onClick={() => {
                nvlRef.current?.fit([]);
                setDetailsContent(null);
              }}
              className="cursor-pointer px-2 py-1 text-[10px] tracking-widest uppercase rounded bg-muted/80 border border-border text-muted-foreground font-serif hover:bg-muted transition-colors"
            >
              Reset
            </Button>
          </div>

          <div className="absolute top-3 right-3 flex gap-1">
            <button
              onClick={() => {
                if (nvlRef.current) {
                  nvlRef.current.setZoom(
                    Math.min(nvlRef.current.getScale() * 1.3, 3),
                  );
                }
              }}
              className="w-7 h-7 flex items-center justify-center text-sm rounded bg-muted/80 border border-border text-muted-foreground font-serif hover:bg-muted transition-colors"
              title="Zoom in"
            >
              +
            </button>
            <button
              onClick={() => {
                if (nvlRef.current) {
                  nvlRef.current.setZoom(
                    Math.max(nvlRef.current.getScale() / 1.3, 0.1),
                  );
                }
              }}
              className="w-7 h-7 flex items-center justify-center text-sm rounded bg-muted/80 border border-border text-muted-foreground font-serif hover:bg-muted transition-colors"
              title="Zoom out"
            >
              −
            </button>
          </div>

          <GraphLegend />

          {detailsContent && (
            <GraphDetailsPanel
              content={detailsContent}
              onClose={() => setDetailsContent(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
