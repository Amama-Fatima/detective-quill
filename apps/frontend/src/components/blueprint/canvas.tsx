"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Node,
  applyNodeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { BlueprintType, BlueprintCard } from "@detective-quill/shared-types";
import {
  createBlueprintCard,
  deleteBlueprintCard,
  updateBlueprintCard,
} from "@/lib/backend-calls/blueprint-cards";
import CanvasCardNode from "./canvas-card-node";
import { useAuth } from "@/context/auth-context";
import EditableProjectName from "./editable-blueprint-name";
import {
  blueprintCardsToNodes,
  mapNodesToBlueprintCards,
} from "@/lib/utils/blueprint-utils";
import { toast } from "sonner";

interface CanvasProps {
  projectName: string;
  blueprintId: string;
  type: BlueprintType;
  prevBlueprintCards: BlueprintCard[] | null;
}

export default function Canvas({
  blueprintId,
  type,
  projectName,
  prevBlueprintCards,
}: CanvasProps) {
  const deleteCard = (nodeId: string) => {
    setNodes((nds) => {
      const nodeToDelete = nds.find((n) => n.id === nodeId);
      if (nodeToDelete?.data.id) {
        setDeletedCards((prev) => [...prev, String(nodeToDelete.data.id)]);
      }
      return nds.filter((n) => n.id !== nodeId);
    });
  };

  const [nodes, setNodes] = useState<Node[]>(() =>
    prevBlueprintCards
      ? blueprintCardsToNodes(
          prevBlueprintCards,
          (id, newContent) => updateNodeContent(id, newContent),
          (id, newTitle) => updateNodeTitle(id, newTitle),
          (id) => deleteCard(id)
        )
      : []
  );
  const [deletedCards, setDeletedCards] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { session } = useAuth();
  const accessToken = session?.access_token;

  // Warn user if they try to refresh/close the tab when there are unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      return "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const updateNodeContent = useCallback((id: string, newContent: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, content: newContent } }
          : node
      )
    );
  }, []);

  const updateNodeTitle = useCallback((id: string, newTitle: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, title: newTitle } }
          : node
      )
    );
  }, []);

  const addCard = () => {
    const reactFlowId = `temp-${Date.now()}`;
    setNodes((nds) => [
      ...nds,
      {
        id: reactFlowId,
        type: "card",
        data: {
          id: null,
          content: "",
          title: "New Card",
          onContentChange: (newContent: string) =>
            updateNodeContent(reactFlowId, newContent),
          onTitleChange: (newTitle: string) =>
            updateNodeTitle(reactFlowId, newTitle),
          onDelete: () => deleteCard(reactFlowId),
        },
        position: {
          x: Math.random() * 400,
          y: Math.random() * 400,
        },
      },
    ]);
  };

  const onNodeChanges = (changes: any) => {
    setNodes((nds) => {
      const updated = applyNodeChanges(changes, nds);
      return updated;
    });
    setIsDirty(true);
  };

  const onSave = async () => {
    setIsSaving(true);
    const cardsToSave = mapNodesToBlueprintCards(nodes);

    const createList = cardsToSave.filter((c) => !c.id); // new cards
    const createListWoId = createList.map(({ id, ...rest }) => rest); // remove id field
    const updateList = cardsToSave.filter((c) => c.id); // existing cards

    try {
      // create new cards
      if (createList.length > 0) {
        await createBlueprintCard(accessToken!, blueprintId, createListWoId);
      }

      // update existing cards
      if (updateList.length > 0) {
        await Promise.all(
          updateList.map((card) =>
            updateBlueprintCard(accessToken!, blueprintId, String(card.id), {
              content: card.content,
              title: card.title,
              position_x: card.position_x,
              position_y: card.position_y,
            })
          )
        );
      }

      if (deletedCards.length > 0) {
        await Promise.all(
          deletedCards.map((cardId) =>
            deleteBlueprintCard(accessToken!, blueprintId, cardId)
          )
        );
        setDeletedCards([]); // clear after save
      }
      toast.success("Cards saved successfully");
    } catch (error) {
      console.error("Error saving cards:", error);
      toast.error("Failed to save cards");
    } finally {
      setIsSaving(false);
      setIsDirty(false);
    }
  };

  const nodeTypes = {
    card: CanvasCardNode,
  };

  return (
    <div className="w-full h-[85vh] flex flex-col">
      {/* Top Bar */}
      <div className="flex bg-secondary justify-between m-2 rounded-lg items-center px-4 py-2 border border-secondary-foreground">
        <EditableProjectName
          initialName={projectName}
          type={type}
          blueprintId={blueprintId}
          accessToken={accessToken!}
        />
        <div className="flex gap-1">
          <Button
            className="cursor-pointer bg-primary hover:bg-primary/90 shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              onSave();
            }}
            disabled={isSaving}
          >
            Save
          </Button>
          <Button
            onClick={() => addCard()}
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
        <Background />
      </ReactFlow>
    </div>
  );
}

//todo: use useCallbacks where needed
