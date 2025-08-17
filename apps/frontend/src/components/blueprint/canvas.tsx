"use client";

import { useState, useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import {
  BlueprintType,
  CardType,
  BlueprintCard,
} from "@detective-quill/shared-types";
import {
  createBlueprintCard,
  deleteBlueprintCard,
  updateBlueprintCard,
} from "@/lib/backend-calls/blueprint-cards";
import CanvasCardNode from "./canvas-card-node";
import { AddCardPopover } from "./add-card-popover";
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
  cardTypes: CardType[];
  userTypes: CardType[] | null;
  userId: string;
  prevBlueprintCards: BlueprintCard[] | null;
}

export default function Canvas({
  blueprintId,
  type,
  cardTypes,
  userTypes,
  userId,
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
          (id) => deleteCard(id)
        )
      : []
  );
  const [deletedCards, setDeletedCards] = useState<string[]>([]);

  const [edges, setEdges] = useState<Edge[]>([]);
  const { session } = useAuth();
  const accessToken = session?.access_token;

  const onConnect = useCallback(
    (connection: any) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const updateNodeContent = useCallback((id: string, newContent: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, content: newContent } }
          : node
      )
    );
  }, []);

  const addCard = (type: CardType) => {
    const reactFlowId = `temp-${Date.now()}`;
    setNodes((nds) => [
      ...nds,
      {
        id: reactFlowId,
        type: "card",
        data: {
          id: null,
          cardTypeTitle: type.title,
          cardTypeId: type.id,
          content: "",
          onChange: (newContent: string) =>
            updateNodeContent(reactFlowId, newContent),
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
  };

  const onEdgeChanges = (changes: any) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  const onSave = async () => {
    const cardsToSave = mapNodesToBlueprintCards(nodes);

    const createList = cardsToSave.filter((c) => !c.id); // new cards
    console.log("This is the create list", createList);
    const createListWoId = createList.map(({ id, ...rest }) => rest); // remove id field
    const updateList = cardsToSave.filter((c) => c.id); // existing cards

    try {
      // create new cards
      if (createList.length > 0) {
        console.log("Creating new cards:", createListWoId);
        await createBlueprintCard(accessToken!, blueprintId, createListWoId);
      }

      // update existing cards
      if (updateList.length > 0) {
        console.log("Updating existing cards:", updateList);
        await Promise.all(
          updateList.map((card) =>
            updateBlueprintCard(accessToken!, blueprintId, String(card.id), {
              content: card.content,
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
    }
  };

  const nodeTypes = {
    card: CanvasCardNode,
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-950 border-b border-gray-300">
        <EditableProjectName
          initialName={projectName}
          type={type}
          blueprintId={blueprintId}
          accessToken={accessToken!}
        />
        <div className="flex gap-3">
          <AddCardPopover
            cardTypes={cardTypes}
            addCard={addCard}
            accessToken={accessToken!}
            userTypes={userTypes}
          />
          <Button
            className="cursor-pointer"
            onClick={() => {
              onSave();
            }}
          >
            Save
          </Button>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodeChanges}
        onEdgesChange={onEdgeChanges}
        onConnect={onConnect}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}

//todo: use useCallbacks where needed
