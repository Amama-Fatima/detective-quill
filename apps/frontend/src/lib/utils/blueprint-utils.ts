import { BlueprintCard } from "@detective-quill/shared-types";
import { Node } from "@xyflow/react"; // or the correct library providing your Node type
import { toast } from "sonner";
import { updateBlueprintById } from "../backend-calls/blueprints";

export const blueprintCardsToNodes = (
  cards: BlueprintCard[],
  updateNodeContent: (id: string, newContent: string) => void,
  deleteCard: (id: string) => void
): Node[] => {
  return cards.map((card) => ({
    id: card.id,
    type: "card",
    position: {
      x: card.position_x ?? Math.random() * 400,
      y: card.position_y ?? Math.random() * 400,
    },
    data: {
      id: card.id,
      cardTypeId: card.card_type_id,
      cardTypeTitle: card.card_type_title,
      content: card.content ?? "",
      onChange: (newContent: string) => updateNodeContent(card.id, newContent),
      onDelete: () => deleteCard(card.id),
    },
  }));
};

export const mapNodesToBlueprintCards = (nodes: Node[]) => {
  const result = nodes.map((node) => ({
    id: node.data.id || null,
    card_type_id: String(node.data.cardTypeId),
    card_type_title: String(node.data.cardTypeTitle),
    content: typeof node.data.content === "string" ? node.data.content : null,
    position_x: node.position.x,
    position_y: node.position.y,
  }));
  console.log("Mapped nodes to blueprint cards:", result);
  return result;
};

export async function onSaveBlueprintName(
  newName: string,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  accessToken: string,
  blueprintId: string
) {
  try {
    setLoading(true);
    await updateBlueprintById(accessToken, blueprintId, { title: newName });
    toast.success("Blueprint updated successfully");
  } catch (error) {
    console.error("Failed to update blueprint:", error);
    toast.error("Failed to update blueprint");
  } finally {
    setLoading(false);
  }
}

export function getBlueprintTypeColor(type: string) {
  const colors = {
    character: "text-blue-800 p-1 rounded-md",
    timeline: "text-green-800 p-2 rounded-md",
    location: "text-purple-800 p-2 rounded-md",
    item: "text-orange-800 p-2 rounded-md",
  };
  return (
    colors[type.toLowerCase() as keyof typeof colors] ||
    "text-gray-800 p-2 rounded-md"
  );
}
