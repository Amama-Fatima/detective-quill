import { createSupabaseServerClient } from "@/supabase/server-client";
import { BlueprintCard } from "@detective-quill/shared-types";

// todo: add RLS policies on supabase side to security
export async function getAllCardsOfBlueprint(
  blueprintId: string,
  userId: string
): Promise<BlueprintCard[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("blueprint_cards")
      .select("*")
      .eq("blueprint_id", blueprintId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to fetch blueprint cards: ${error.message}`);
    }

    return data as BlueprintCard[];
  } catch (err) {
    console.error("Error in getAllCardsOfBlueprint:", err);
    throw err instanceof Error
      ? err
      : new Error("Unknown error fetching blueprint cards");
  }
}
