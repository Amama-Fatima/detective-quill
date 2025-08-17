import { createSupabaseServerClient } from "@/supabase/server-client";
import type { BlueprintType, CardType } from "@detective-quill/shared-types";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserCardTypes(
  supabase: SupabaseClient,
  userId: string,
  type: BlueprintType
): Promise<CardType[] | []> {
  try {
    const { data, error } = await supabase
      .from("card_types")
      .select("*")
      .eq("user_id", userId)
      .eq("blueprint_type", type)
      .eq("is_custom", true);

    if (error) {
      console.log(error);
      throw new Error(`Failed to retrieve card types: ${error.message}`);
    }

    console.log("Retrieved user card types:", data);

    return data || [];
  } catch (err) {
    console.error("Error in getUserCardTypes:", err);
    throw err instanceof Error
      ? err
      : new Error("Unknown error retrieving card types");
  }
}

export async function getDefaultCardTypesForBlueprintType(
  supabase: SupabaseClient,

  type: BlueprintType
): Promise<CardType[]> {
  try {
    const { data, error } = await supabase
      .from("card_types")
      .select("*")
      .eq("is_custom", false)
      .eq("blueprint_type", type);

    if (error) {
      console.log(error);

      throw new Error(`Failed to retrieve card types: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error("Error in getDefaultCardTypes:", err);
    throw err instanceof Error
      ? err
      : new Error("Unknown error retrieving card types");
  }
}
