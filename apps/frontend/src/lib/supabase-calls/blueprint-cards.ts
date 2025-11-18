import { BlueprintCard } from "@detective-quill/shared-types";
import { createSupabaseServerClient } from "@/supabase/server-client";

// todo: add RLS policies on supabase side to security
export async function getAllCardsOfBlueprint(
  blueprintId: string,
  userId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<{ blueprint_cards: BlueprintCard[] | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("blueprint_cards")
      .select("*")
      .eq("blueprint_id", blueprintId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to fetch blueprint cards: ${error.message}`);
    }

    return { blueprint_cards: data as BlueprintCard[] | null, error: null };
  } catch (err) {
    console.error("Error in getAllCardsOfBlueprint:", err);
    const msg =
      err instanceof Error
        ? err
        : new Error("Unknown error fetching blueprint cards");
    return { blueprint_cards: null, error: msg.message };
  }
}
