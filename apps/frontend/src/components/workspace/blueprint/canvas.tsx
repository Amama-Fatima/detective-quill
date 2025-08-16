"use client";

import { useState, useCallback, useEffect } from "react";
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
import { BlueprintType, CardType } from "@detective-quill/shared-types";

interface CanvasProps {
  projectId: string;
  blueprintId: string;
  type: BlueprintType;
  cardTypes: CardType[];
  userTypes: CardType[] | null;
}
import CanvasCardNode from "./canvas-card-node";

export default function Canvas({
  projectId,
  blueprintId,
  type,
  cardTypes,
  userTypes,
}: CanvasProps) {
  const projectName = "Untitled Project";

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

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
    const id = `${type.id}-${Date.now()}`;
    setNodes((nds) => [
      ...nds,
      {
        id,
        type: "card",
        data: {
          cardTypeTitle: type.title,
          cardTypeId: type.id,
          content: "",
          onChange: (newContent: string) => updateNodeContent(id, newContent),
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
      // Save positions to DB here if needed
      return updated;
    });
  };

  const onEdgeChanges = (changes: any) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  const nodeTypes = {
    card: CanvasCardNode,
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Top Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-900 border-b border-gray-300">
        <h1 className="text-lg font-semibold capitalize">
          {projectName} — {type} Blueprint
        </h1>
        <div>
          <Button
            // onClick={() => {
            //   const choice = window.prompt(
            //     `Choose card type:\n${cardTypes
            //       .map((t, i) => {
            //         if (t.blueprint_type == type) {
            //           return `${i + 1}. ${t.title}`;
            //         }
            //       })
            //       .join("\n")}`
            //   );

            //   const index = Number(choice) - 1;
            //   if (!isNaN(index) && cardTypes[index]) {
            //     addCard(cardTypes[index]);
            //   }
            // }}
          >
            + Add Card
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1">
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
    </div>
  );
}
