// components/Neo4jNVLVisualization.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
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

// Selection state interface
interface SelectionState {
  nodes: Set<string>;
  relationships: Set<string>;
}

export default function Neo4jNVLVisualization({ sceneId }: { sceneId?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nvlRef = useRef<NVL>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [selection, setSelection] = useState<SelectionState>({ nodes: new Set(), relationships: new Set() });
  const [hoveredElement, setHoveredElement] = useState<any>(null);
  const [neighbors, setNeighbors] = useState<Set<string>>(new Set());
  const [showDetails, setShowDetails] = useState(false);
  const [detailsContent, setDetailsContent] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1.2);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const { nodes: rawNodes, relationships: rawRels, loading, error } = 
    useNeo4jGraphData(sceneId);

  // Transform nodes to NVL format with your styling
  const nodes = rawNodes.map(node => {
    const primaryLabel = node.labels[0] || 'Entity';
    const color = LABEL_COLORS[primaryLabel] || THEME.muted;
    const isSelected = selection.nodes.has(node.id);
    const isNeighbor = neighbors.has(node.id);
    
    return {
      id: node.id,
      label: node.properties.name || node.properties.scene_id || node.id,
      color: color,
      size: isSelected ? 36 : isNeighbor ? 32 : 28, // Highlight selected/neighbor nodes
      caption: node.properties.name || '',
      properties: node.properties,
      labels: node.labels,
      borderWidth: isSelected ? 3 : isNeighbor ? 2 : 1,
      borderColor: isSelected ? THEME.foreground : isNeighbor ? THEME.accent : undefined,
      tooltip: () => `
        <div style="font-family: serif; padding: 8px; max-width: 250px;">
          <div style="font-weight: bold; border-bottom: 1px solid ${THEME.border}; margin-bottom: 6px; padding-bottom: 4px;">
            ${node.properties.name || node.properties.scene_id || 'Unnamed'}
          </div>
          <div><strong>Type:</strong> ${primaryLabel}</div>
          ${node.properties.role ? `<div><strong>Role:</strong> ${node.properties.role}</div>` : ''}
          ${node.properties.type ? `<div><strong>Entity Type:</strong> ${node.properties.type}</div>` : ''}
          ${node.properties.description ? `<div style="margin-top: 6px;"><strong>Description:</strong><br/>${node.properties.description}</div>` : ''}
        </div>
      `
    };
  });

  // Transform relationships to NVL format
  const relationships = rawRels.map(rel => {
    const isSelected = selection.relationships.has(rel.id);
    
    return {
      id: rel.id,
      from: rel.from,
      to: rel.to,
      type: rel.type,
      caption: rel.type.replace(/_/g, ' ').toLowerCase(),
      properties: rel.properties,
      color: isSelected ? THEME.accent : THEME.border,
      width: isSelected ? 3 : 1.5,
      tooltip: () => `
        <div style="font-family: serif; padding: 8px; max-width: 250px;">
          <div style="font-weight: bold; border-bottom: 1px solid ${THEME.border}; margin-bottom: 6px; padding-bottom: 4px;">
            ${rel.type.replace(/_/g, ' ').toLowerCase()}
          </div>
          ${rel.properties.description ? `<div><strong>Description:</strong> ${rel.properties.description}</div>` : ''}
          ${rel.properties.confidence ? `<div><strong>Confidence:</strong> ${(rel.properties.confidence * 100).toFixed(0)}%</div>` : ''}
          ${rel.properties.scene_id ? `<div><strong>Scene:</strong> ${rel.properties.scene_id}</div>` : ''}
          ${rel.properties.mentions ? `<div><strong>Mentions:</strong> ${rel.properties.mentions.join(', ')}</div>` : ''}
        </div>
      `
    };
  });

  // Helper to find neighbors of a node
  const findNeighbors = useCallback((nodeId: string) => {
    const neighborIds = new Set<string>();
    relationships.forEach(rel => {
      if (rel.from === nodeId) neighborIds.add(rel.to);
      if (rel.to === nodeId) neighborIds.add(rel.from);
    });
    return neighborIds;
  }, [relationships]);

  // NVL options
  const nvlOptions = {
    initialZoom: 1.2,
    disableTelemetry: true,
    renderer: 'canvas' as const,
    layout: 'forceDirected' as const,
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
        borderWidth: 3
      },
      relationship: {
        color: THEME.accent,
        width: 3
      }
    },
    // Enable physics but allow dragging
    physics: {
      enabled: true,
      stabilization: true,
      adaptiveTimestep: true
    },
    // Interaction settings
    interaction: {
      dragNodes: true,
      dragView: true,
      zoomView: true,
      hover: true,
      hoverDelay: 100,
      multiselect: true,
      selectable: true,
      selectableEdges: true
    }
  };

  // Enhanced mouse event callbacks with all possible interactions
  const mouseEventCallbacks = {
    // Click events
    onNodeClick: (node: any, _hitElements: unknown, event: MouseEvent) => {
      console.log('Node clicked:', node);
      
      if (event.ctrlKey || event.metaKey) {
        // Multi-select with Ctrl/Cmd
        setSelection(prev => {
          const newNodes = new Set(prev.nodes);
          if (newNodes.has(node.id)) {
            newNodes.delete(node.id);
          } else {
            newNodes.add(node.id);
          }
          return { ...prev, nodes: newNodes };
        });
      } else if (event.shiftKey) {
        // Select neighborhood with Shift
        const neighborIds = findNeighbors(node.id);
        setSelection(prev => ({
          nodes: new Set([node.id, ...neighborIds]),
          relationships: new Set()
        }));
        setNeighbors(neighborIds);
      } else {
        // Single select
        setSelection({ nodes: new Set([node.id]), relationships: new Set() });
        setNeighbors(findNeighbors(node.id));
        
        // Show details panel
        setDetailsContent({
          type: 'node',
          data: node,
          properties: node.properties,
          labels: node.labels
        });
        setShowDetails(true);
      }
    },

    onRelationshipClick: (rel: any, _hitElements: unknown, event: MouseEvent) => {
      console.log('Relationship clicked:', rel);
      
      if (event.ctrlKey || event.metaKey) {
        setSelection(prev => {
          const newRels = new Set(prev.relationships);
          if (newRels.has(rel.id)) {
            newRels.delete(rel.id);
          } else {
            newRels.add(rel.id);
          }
          return { ...prev, relationships: newRels };
        });
      } else {
        setSelection({ nodes: new Set(), relationships: new Set([rel.id]) });
        
        // Show details panel
        setDetailsContent({
          type: 'relationship',
          data: rel,
          properties: rel.properties,
          relType: rel.type
        });
        setShowDetails(true);
      }
    },

    onCanvasClick: (event: MouseEvent) => {
      console.log('Canvas clicked');
      // Deselect all
      setSelection({ nodes: new Set(), relationships: new Set() });
      setNeighbors(new Set());
      setShowDetails(false);
      setDetailsContent(null);
    },

    // Double click events
    onNodeDoubleClick: (node: any, _hitElements: unknown, _event: MouseEvent) => {
      console.log('Node double-clicked:', node);
      // Fit view to this node (NVL.fit(nodeIds, zoomOptions))
      if (nvlRef.current) {
        nvlRef.current.fit([node.id]);
      }
    },

    onRelationshipDoubleClick: (rel: any, _hitElements: unknown, _event: MouseEvent) => {
      console.log('Relationship double-clicked:', rel);
      // Highlight the connected nodes
      const connectedNodes = new Set([rel.from, rel.to]);
      setNeighbors(connectedNodes);
      setSelection({ nodes: connectedNodes, relationships: new Set([rel.id]) });
    },

    // Hover events
    onNodeHover: (node: any, _hitElements: unknown, _event: MouseEvent) => {
      setHoveredElement({ type: 'node', data: node });
    },

    onRelationshipHover: (rel: any, _hitElements: unknown, _event: MouseEvent) => {
      setHoveredElement({ type: 'relationship', data: rel });
    },

    // Mouse events
    onNodeMouseDown: (node: any, _hitElements: unknown, event: MouseEvent) => {
      console.log('Node mouse down:', node);
      setIsDragging(true);
    },

    onNodeMouseUp: (node: any, _hitElements: unknown, event: MouseEvent) => {
      console.log('Node mouse up:', node);
      setIsDragging(false);
    },

    onNodeMouseMove: (node: any, _hitElements: unknown, _event: MouseEvent) => {
      // Optional: track mouse movement on node
    },

    // Drag events
    onNodeDragStart: (node: any, _hitElements: unknown, event: MouseEvent) => {
      console.log('Node drag start:', node);
      setIsDragging(true);
    },

    onNodeDrag: (node: any, _hitElements: unknown, _event: MouseEvent) => {
      // Node is being dragged
    },

    onNodeDragEnd: (node: any, _hitElements: unknown, event: MouseEvent) => {
      console.log('Node drag end:', node);
      setIsDragging(false);
    },

    // Canvas events
    onCanvasDragStart: (_hitElements: unknown, event: MouseEvent) => {
      console.log('Canvas drag start');
      setIsDragging(true);
    },

    onCanvasDrag: (_hitElements: unknown, _event: MouseEvent) => {
      // Canvas is being dragged
    },

    onCanvasDragEnd: (_hitElements: unknown, event: MouseEvent) => {
      console.log('Canvas drag end');
      setIsDragging(false);
    },

    // Zoom events
    onZoom: (zoomLevel: number) => {
      setCurrentZoom(zoomLevel);
    },

    // Viewport events
    onViewportChange: (viewport: unknown) => {
      // Viewport changed (pan or zoom)
    },

    // Right-click events
    onNodeRightClick: (node: any, _hitElements: unknown, event: MouseEvent) => {
      event.preventDefault();
      console.log('Node right-click:', node);
      // Open context menu (you could implement your own)
    },

    onRelationshipRightClick: (rel: any, _hitElements: unknown, event: MouseEvent) => {
      event.preventDefault();
      console.log('Relationship right-click:', rel);
    },

    onCanvasRightClick: (event: MouseEvent) => {
      event.preventDefault();
      console.log('Canvas right-click');
    },

    // Key events (these need to be handled at the component level)
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Clear selection on Escape
        setSelection({ nodes: new Set(), relationships: new Set() });
        setNeighbors(new Set());
        setShowDetails(false);
        setDetailsContent(null);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Optional: handle delete of selected items
        if (selection.nodes.size > 0 || selection.relationships.size > 0) {
          console.log('Delete selected items:', selection);
        }
      } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        // Select all on Ctrl/Cmd + A
        e.preventDefault();
        setSelection({
          nodes: new Set(nodes.map(n => n.id)),
          relationships: new Set(relationships.map(r => r.id))
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes, relationships, selection]);

  // Update status
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

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Fit graph to view (NVL.fit(nodeIds, zoomOptions) – empty array = fit all)
  const fitGraph = () => {
    if (nvlRef.current) {
      nvlRef.current.fit([]);
    }
  };

  // Reset graph
  const resetGraph = () => {
    if (nvlRef.current) {
      nvlRef.current.fit([]);
      setSelection({ nodes: new Set(), relationships: new Set() });
      setNeighbors(new Set());
      setShowDetails(false);
      setDetailsContent(null);
    }
  };

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

          {/* Top Controls */}
          <div className="absolute top-3 left-3 flex gap-2">
            <button
              onClick={fitGraph}
              className="px-2 py-1 text-[10px] tracking-widest uppercase rounded bg-muted/80 border border-border text-muted-foreground font-serif hover:bg-muted transition-colors"
              title="Fit graph to view"
            >
              Fit
            </button>
            <button
              onClick={resetGraph}
              className="px-2 py-1 text-[10px] tracking-widest uppercase rounded bg-muted/80 border border-border text-muted-foreground font-serif hover:bg-muted transition-colors"
              title="Reset view"
            >
              Reset
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-2 py-1 text-[10px] tracking-widest uppercase rounded bg-muted/80 border border-border text-muted-foreground font-serif hover:bg-muted transition-colors"
            >
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </button>
          </div>

          <div className="absolute top-3 right-3 text-[10px] tracking-widest uppercase px-2 py-1 rounded bg-muted/80 border border-border text-muted-foreground font-serif">
            Zoom: {Math.round(currentZoom * 100)}% · {isDragging ? 'Dragging' : 'Ready'}
          </div>

          {/* Selection Info */}
          {(selection.nodes.size > 0 || selection.relationships.size > 0) && (
            <div className="absolute top-16 left-3 text-[10px] px-2 py-1 rounded bg-accent/20 border border-accent text-foreground font-serif">
              Selected: {selection.nodes.size} node(s), {selection.relationships.size} relationship(s)
            </div>
          )}

          {/* Hover Info */}
          {hoveredElement && !showDetails && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-[10px] px-2 py-1 rounded bg-muted/80 border border-border text-foreground font-serif">
              Hovering: {hoveredElement.type === 'node' 
                ? hoveredElement.data.properties?.name || hoveredElement.data.id 
                : hoveredElement.data.type?.replace(/_/g, ' ').toLowerCase()}
            </div>
          )}

          {/* Legend */}
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
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2 text-[8px] text-muted-foreground">
                <span>Ctrl+Click: Multi-select</span>
                <span>Shift+Click: Select neighbors</span>
              </div>
              <div className="flex items-center gap-2 text-[8px] text-muted-foreground mt-1">
                <span>Double-click: Zoom to node</span>
                <span>Esc: Clear selection</span>
              </div>
            </div>
          </div>

          {/* Details Panel */}
          {showDetails && detailsContent && (
            <div className="absolute bottom-4 right-4 max-w-xs rounded-md bg-card/95 border border-border backdrop-blur-sm shadow-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-sm font-serif text-foreground">
                  {detailsContent.type === 'node' ? 'Node Details' : 'Relationship Details'}
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              
              {detailsContent.type === 'node' ? (
                <div className="space-y-2">
                  <p className="text-xs font-mono text-muted-foreground break-all">
                    <span className="text-foreground">ID:</span> {detailsContent.data.id}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    <span className="text-foreground">Labels:</span> {detailsContent.labels?.join(', ')}
                  </p>
                  <div className="pt-2 border-t border-border">
                    {Object.entries(detailsContent.properties || {}).map(([key, value]) => (
                      <p key={key} className="text-xs font-mono text-muted-foreground break-all">
                        <span className="text-foreground">{key}:</span> {String(value)}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-mono text-muted-foreground">
                    <span className="text-foreground">Type:</span> {detailsContent.relType}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    <span className="text-foreground">From:</span> {detailsContent.data.from}
                  </p>
                  <p className="text-xs font-mono text-muted-foreground">
                    <span className="text-foreground">To:</span> {detailsContent.data.to}
                  </p>
                  <div className="pt-2 border-t border-border">
                    {Object.entries(detailsContent.properties || {}).map(([key, value]) => (
                      <p key={key} className="text-xs font-mono text-muted-foreground break-all">
                        <span className="text-foreground">{key}:</span> {String(value)}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Keyboard shortcuts hint */}
          <div className="absolute bottom-4 right-4 text-[8px] text-muted-foreground opacity-50">
            Press ? for shortcuts
          </div>
        </>
      )}
    </div>
  );
}