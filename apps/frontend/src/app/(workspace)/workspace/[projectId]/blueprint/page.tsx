import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import { getProjectBlueprints } from "@/lib/supabase-calls/blueprint";
import { UserBlueprintsList } from "@/components/blueprint/user-bueprints-list";
import ErrorMsg from "@/components/error-msg";
import { fetchProjectTitle } from "@/lib/supabase-calls/editor-workspace";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { getUserFromCookie } from "@/lib/utils/get-user";
import BlueprintHeader from "@/components/blueprint/blueprint-header";

interface BlueprintPageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
  const { title, error } = await fetchProjectTitle(projectId);
  if (error || !title)
    return { title: "Blueprints", description: "Project Blueprints page" };
  return {
    title: `${title} - Blueprints`,
    description: `Blueprints page for project ${title}`,
  };
}

export default async function BlueprintPage({ params }: BlueprintPageProps) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();

  const user = await getUserFromCookie();
  if (!user) redirect("/auth/sign-in");

  const { blueprints, error } = await getProjectBlueprints(projectId, supabase);
  if (error) return <ErrorMsg message="Failed to load blueprints" />;

  const count = blueprints?.length ?? 0;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none absolute top-[35%] right-[-30px] w-[100px] h-[100px] rounded-full bg-secondary-foreground opacity-25 z-[1]" />
      <div className="pointer-events-none absolute bottom-[20%] left-[-20px] w-[130px] h-[130px] rounded-full bg-secondary-foreground opacity-20 z-[1]" />

      <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[radial-gradient(oklch(24%_0.022_245)_1px,transparent_1px)] bg-size-[28px_28px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-0">
        <BlueprintHeader projectId={projectId} />

        <div className="pt-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted-foreground/50 shrink-0">
              All Blueprints
            </span>
            <div className="flex-1 border-t border-border/50" />
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted-foreground/35 shrink-0">
              {count} {count === 1 ? "file" : "files"} on record
            </span>
          </div>
          <UserBlueprintsList blueprints={blueprints} projectId={projectId} />
        </div>
      </div>
    </div>
  );
}