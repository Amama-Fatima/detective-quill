import { BlueprintCard } from "@detective-quill/shared-types";
import { SupabaseClient } from "@supabase/supabase-js";

// todo: add RLS policies on supabase side to security
export async function getAllCardsOfBlueprint(
  supabase: SupabaseClient,
  blueprintId: string,
  userId: string
): Promise<BlueprintCard[] | null> {
  try {
    const { data, error } = await supabase
      .from("blueprint_cards")
      .select("*")
      .eq("blueprint_id", blueprintId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to fetch blueprint cards: ${error.message}`);
    }

    return data as BlueprintCard[] | null;
  } catch (err) {
    console.error("Error in getAllCardsOfBlueprint:", err);
    throw err instanceof Error
      ? err
      : new Error("Unknown error fetching blueprint cards");
  }
}
