import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { useState } from "react";
import {
  createBlueprintCard,
  deleteBlueprintCard,
  updateBlueprintCard,
} from "@/lib/backend-calls/blueprint-cards";
import { Node } from "@xyflow/react";
import { mapNodesToBlueprintCards } from "@/lib/utils/blueprint-utils";

interface UseBlueprintCardsParams {
  nodes: Node[];
  blueprintId: string;
  projectId: string;
  deletedCards: string[];
  setDeletedCards: (ids: string[]) => void;
}

export function useBlueprintCards({
  nodes,
  blueprintId,
  projectId,
  deletedCards,
  setDeletedCards,
}: UseBlueprintCardsParams) {
  const { session } = useAuth();
  const accessToken = session?.access_token || "";
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    setLoading(true);
    const cardsToSave = mapNodesToBlueprintCards(nodes);

    const createList = cardsToSave.filter((c) => !c.id); // new cards
    const createListWoId = createList.map(({ id, ...rest }) => rest); // remove id field
    const updateList = cardsToSave.filter((c) => c.id); // existing cards

    try {
      // create new cards
      if (createList.length > 0) {
        await createBlueprintCard(
          accessToken!,
          blueprintId,
          createListWoId,
          projectId,
        );
      }

      // update existing cards
      if (updateList.length > 0) {
        await Promise.all(
          updateList.map((card) =>
            updateBlueprintCard(
              accessToken!,
              blueprintId,
              String(card.id),
              {
                content: card.content,
                title: card.title,
                position_x: card.position_x,
                position_y: card.position_y,
              },
              projectId,
            ),
          ),
        );
      }

      if (deletedCards.length > 0) {
        await Promise.all(
          deletedCards.map((cardId) =>
            deleteBlueprintCard(accessToken!, blueprintId, cardId, projectId),
          ),
        );
        setDeletedCards([]); // clear after save
      }
      toast.success("Cards saved successfully");
      return true;
    } catch (error) {
      console.error("Error saving cards:", error);
      toast.error("Failed to save cards");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { onSave, loading };
}
