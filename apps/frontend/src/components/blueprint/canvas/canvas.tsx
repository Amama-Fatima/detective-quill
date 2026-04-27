"use client";

import { useState, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { BlueprintType, BlueprintCard } from "@detective-quill/shared-types";
import CanvasCardNode from "./canvas-card-node";
import EditableBlueprintName from "./editable-blueprint-name";
import { useBlueprintNodes } from "@/hooks/blueprints/use-blueprint-nodes";
import { useBlueprintCards } from "@/hooks/blueprints/use-blueprint-cards";

interface CanvasProps {
  blueprintName: string;
  blueprintId: string;
  type: BlueprintType;
  prevBlueprintCards: BlueprintCard[] | null;
  isOwner: boolean;
  isActive: boolean;
  projectId: string;
}

export default function Canvas({
  blueprintId,
  type,
  blueprintName,
  prevBlueprintCards,
  isOwner,
  isActive,
  projectId,
}: CanvasProps) {
  const { nodes, setNodes, addCard, deletedCards, setDeletedCards } =
    useBlueprintNodes(prevBlueprintCards, isOwner, isActive);

  const { onSave, loading } = useBlueprintCards({
    nodes,
    blueprintId,
    projectId,
    deletedCards,
    setDeletedCards,
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isOwner && !isDirty) return;
      e.preventDefault();
      return "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isOwner]);

  // @ts-ignore
  const onNodeChanges = (changes: any) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
    setIsDirty(true);
  };

  const nodeTypes = { card: CanvasCardNode };

  const handleSave = async () => {
    const success = await onSave();
    if (success) setIsDirty(false);
  };

  return (
    // h-full fills the 100dvh parent; flex-col so top bar + flow share the space
    <div className="w-full h-full flex flex-col pl-2">
      <div className="flex shrink-0 justify-between items-center px-8 py-2 border-b border-border bg-secondary">
        <EditableBlueprintName
          initialName={blueprintName}
          type={type}
          blueprintId={blueprintId}
          isOwner={isOwner}
          isActive={isActive}
        />
        <div className="flex gap-2">
          <Button
            className="cursor-pointer bg-primary hover:bg-primary/90 shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleSave}
            disabled={loading || !isDirty || !isOwner || !isActive}
          >
            Save
          </Button>
          <Button
            onClick={() => {
              addCard();
              setIsDirty(true);
            }}
            disabled={!isOwner || !isActive}
            className="cursor-pointer bg-primary hover:bg-primary/90 shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Card
          </Button>
        </div>
      </div>

      {/* ── React Flow — takes all remaining height ── */}
      <div className="flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodeChanges}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          fitView={false}
          style={{ width: "100%", height: "100%" }}
        >
          <MiniMap />
          <Controls />
          <Background
            variant={"dots" as any}
            gap={12}
            size={2}
            color="#593e04"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
