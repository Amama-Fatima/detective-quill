import { createSupabaseServerClient } from "@/supabase/server-client";
import type { Blueprint } from "@detective-quill/shared-types";

export async function getUserBlueprints(userId: string): Promise<Blueprint[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("blue_prints")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to get user blueprints: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error("Error in getUserBlueprints:", err);
    throw err instanceof Error
      ? err
      : new Error("Unknown error fetching user blueprints");
  }
}

export async function getUserBlueprintById(
  blueprintId: string,
  userId: string
): Promise<Blueprint> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("blue_prints")
      .select("*")
      .eq("id", blueprintId)
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to get user blueprint: ${error.message}`);
    }

    return data as Blueprint;
  } catch (err) {
    console.error("Error in getUserBlueprintById:", err);
    throw err instanceof Error
      ? err
      : new Error("Unknown error fetching user blueprint");
  }
}
