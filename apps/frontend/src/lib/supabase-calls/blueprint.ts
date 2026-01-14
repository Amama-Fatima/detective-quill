import { createSupabaseServerClient } from "@/supabase/server-client";
import type { Blueprint } from "@detective-quill/shared-types";

export async function getProjectBlueprints(
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<{ blueprints: Blueprint[]; error: string | null }> {
  const { data, error } = await supabase
    .from("blue_prints")
    .select("*")
    .eq("project_id", projectId);

  if (error) {
    return { blueprints: [], error: error.message };
  }

  console.log("Fetched blueprints data:", data);

  return { blueprints: data || [], error: null };
}

export async function getProjectBlueprintById(
  blueprintId: string,
  projectId: string,
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>
): Promise<{ blueprint: Blueprint | null; error: string | null }> {
  const { data, error } = await supabase
    .from("blue_prints")
    .select("*")
    .eq("id", blueprintId)
    .eq("project_id", projectId)
    .single();

  if (error) {
    return { blueprint: null, error: error.message };
  }

  return { blueprint: data as Blueprint, error: null };
}

export async function getBlueprintTitle(
  blueprintId: string,
  projectId: string
): Promise<{ title: string | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("blue_prints")
    .select("title")
    .eq("id", blueprintId)
    .eq("project_id", projectId)
    .single();

  console.log(error);
  if (error) {
    return { title: null, error: error.message };
  }

  return { title: data?.title || null, error: null };
}
