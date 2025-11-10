import { createSupabaseServerClient } from "@/supabase/server-client";
import type { Blueprint } from "@detective-quill/shared-types";

export async function getUserBlueprints(
  userId: string
): Promise<{ blueprints: Blueprint[]; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("blue_prints")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to get user blueprints: ${error.message}`);
    }

    return { blueprints: data || [], error: null };
  } catch (err) {
    console.error("Error in getUserBlueprints:", err);
    const msg =
      err instanceof Error
        ? err.message
        : "Unknown error fetching user blueprints";
    return { blueprints: [], error: msg };
  }
}

export async function getUserBlueprintById(
  blueprintId: string,
  userId: string
): Promise<{ blueprint: Blueprint | null; error: string | null }> {
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

    return { blueprint: data as Blueprint, error: null };
  } catch (err) {
    console.error("Error in getUserBlueprintById:", err);
    return {
      blueprint: null,
      error:
        err instanceof Error
          ? err.message
          : "Unknown error fetching user blueprint",
    };
  }
}
