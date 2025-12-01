import { createSupabaseServerClient } from "@/supabase/server-client";
import type { Blueprint } from "@detective-quill/shared-types";

export async function getProjectBlueprints(
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<{ blueprints: Blueprint[]; error: string | null }> {
  console.log("Fetching blueprints for projectId:", projectId);
  try {
    const { data, error } = await supabase
      .from("blue_prints")
      .select("*")
      .eq("project_id", projectId);

    if (error) {
      throw new Error(`Failed to get user blueprints: ${error.message}`);
    }

    console.log("Fetched blueprints data:", data);

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

export async function getProjectBlueprintById(
  blueprintId: string,
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<{ blueprint: Blueprint | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from("blue_prints")
      .select("*")
      .eq("id", blueprintId)
      .eq("project_id", projectId)
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

export async function getBlueprintTitle(
  blueprintId: string,
  projectId: string
): Promise<{ title: string | null; error: string | null }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("blue_prints")
      .select("title")
      .eq("id", blueprintId)
      .eq("project_id", projectId)
      .single();

    console.log("Fetched blueprint title:", data);
    console.log(error);
    if (error) {
      throw new Error(`Failed to get blueprint title: ${error.message}`);
    }

    return { title: data?.title || null, error: null };
  } catch (err) {
    console.error("Error in getBlueprintTitle:", err);
    return {
      title: null,
      error:
        err instanceof Error
          ? err.message
          : "Unknown error fetching blueprint title",
    };
  }
}
