import { BlueprintCard } from "@detective-quill/shared-types";
import { createSupabaseServerClient } from "@/supabase/server-client";

// todo: add RLS policies on supabase side to security
export async function getAllCardsOfBlueprint(
  blueprintId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<{ blueprint_cards: BlueprintCard[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from("blueprint_cards")
    .select("*")
    .eq("blueprint_id", blueprintId);

  if (error) {
    return { blueprint_cards: null, error: error.message };
  }

  return { blueprint_cards: data as BlueprintCard[] | null, error: null };
}
