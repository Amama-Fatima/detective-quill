import { useCallback, useState } from "react";
import { Node } from "@xyflow/react";
import { blueprintCardsToNodes } from "@/lib/utils/blueprint-utils";
import { BlueprintCard } from "@detective-quill/shared-types/api";

export function useBlueprintNodes(
  prevBlueprintCards: BlueprintCard[] | null,
  isOwner: boolean,
  isActive: boolean,
) {
  const [deletedCards, setDeletedCards] = useState<string[]>([]);

  const [nodes, setNodes] = useState<Node[]>(() =>
    prevBlueprintCards
      ? blueprintCardsToNodes(
          prevBlueprintCards,
          (id, newContent) => updateNodeContent(id, newContent),
          (id, newTitle) => updateNodeTitle(id, newTitle),
          (id) => deleteCard(id),
          isOwner,
          isActive,
        )
      : [],
  );

  const updateNodeContent = useCallback((id: string, newContent: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, content: newContent } }
          : node,
      ),
    );
  }, []);

  const updateNodeTitle = useCallback((id: string, newTitle: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, title: newTitle } }
          : node,
      ),
    );
  }, []);

  const deleteCard = (nodeId: string) => {
    setNodes((nds) => {
      const nodeToDelete = nds.find((n) => n.id === nodeId);
      if (nodeToDelete?.data.id) {
        setDeletedCards((prev) => [...prev, String(nodeToDelete.data.id)]);
      }
      return nds.filter((n) => n.id !== nodeId);
    });
  };

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
          isOwner,
          isActive,
        },
        position: {
          x: Math.random() * 400,
          y: Math.random() * 400,
        },
      },
    ]);
  };

  return { nodes, setNodes, addCard, deletedCards, setDeletedCards };
}
