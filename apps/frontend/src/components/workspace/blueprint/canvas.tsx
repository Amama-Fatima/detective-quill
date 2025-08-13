"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
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

interface CanvasProps {
  projectName: string;
  type: string;
}
import CanvasCardNode from "./canvas-card-node";

type CardType = {
  id: string;
  title: string;
  description?: string;
  is_custom: false;
  user_id?: string;
  blueprint_type: "character" | "culture";
  created_at: Date;
};

// Hardcoded mapping for now
const CARD_TYPES: Record<string, CardType[]> = {
  character: [
    {
      id: "bio",
      title: "Bio",
      description: "A brief biography of the character.",
      is_custom: false,
      blueprint_type: "character",
      created_at: new Date(),
    },
    {
      id: "appearance",
      title: "Physical Appearance",
      description: "Details about the character's appearance.",
      is_custom: false,
      blueprint_type: "character",
      created_at: new Date(),
    },
  ],
  culture: [
    {
      id: "politics",
      title: "Political System",
      description: "The political system of the culture.",
      is_custom: false,
      blueprint_type: "culture",
      created_at: new Date(),
    },
    {
      id: "social",
      title: "Social Structure",
      description: "The social hierarchy and structure.",
      is_custom: false,
      blueprint_type: "culture",
      created_at: new Date(),
    },
  ],
};

export default function Canvas({ projectName, type }: CanvasProps) {
  const blueprintType = type || "character";
  projectName = projectName || "Untitled Project";

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
        data: { cardTypeTitle: type.title, cardTypeId: type.id, content: "", onChange: (newContent: string) => updateNodeContent(id, newContent) },
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
          {projectName} — {blueprintType} Blueprint
        </h1>
        <div>
          <Button
            onClick={() => {
              const types = CARD_TYPES[blueprintType] || [];
              const choice = window.prompt(
                `Choose card type:\n${types
                  .map((t, i) => `${i + 1}. ${t.title}`)
                  .join("\n")}`
              );
              const index = Number(choice) - 1;
              if (!isNaN(index) && types[index]) {
                addCard(types[index]);
              }
            }}
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
