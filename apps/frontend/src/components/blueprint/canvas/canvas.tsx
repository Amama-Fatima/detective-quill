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
import { useBlueprintNodes } from "@/hooks/use-blueprint-nodes";
import { useBlueprintCards } from "@/hooks/use-blueprint-cards";

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

  // Warn user if they try to refresh/close the tab when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isOwner) {
        if (!isDirty) {
          return;
        }
      }
      e.preventDefault();
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isOwner]);

  const onNodeChanges = (changes: any) => {
    setNodes((nds) => {
      const updated = applyNodeChanges(changes, nds);
      return updated;
    });
    setIsDirty(true);
  };

  const nodeTypes = {
    card: CanvasCardNode,
  };

  const handleSave = async () => {
    const success = await onSave();
    if (success) {
      setIsDirty(false);
    }
  };

  return (
    <div className="w-full h-[85vh] flex flex-col">
      {/* Top Bar */}
      <div className="flex bg-secondary justify-between m-2 rounded-lg items-center px-4 py-2 border border-secondary-foreground">
        <EditableBlueprintName
          initialName={blueprintName}
          type={type}
          blueprintId={blueprintId}
          isOwner={isOwner}
          isActive={isActive}
        />
        <div className="flex gap-1">
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
            className="text-left cursor-pointer bg-primary hover:bg-primary/90 shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Card{" "}
          </Button>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodeChanges}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        fitView={false}
      >
        <MiniMap />
        <Controls />
        <Background variant={"dots" as any} gap={12} size={2} color="#593e04" />
      </ReactFlow>
    </div>
  );
}

//todo: use useCallbacks where needed
