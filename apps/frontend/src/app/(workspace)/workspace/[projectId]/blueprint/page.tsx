import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import CreateBlueprintBtns from "@/components/blueprint/btns/create-blueprint-btns";
import { getProjectBlueprints } from "@/lib/supabase-calls/blueprint";
import { UserBlueprintsList } from "@/components/blueprint/user-bueprints-list";
import ErrorMsg from "@/components/error-msg";
import { fetchProjectTitle } from "@/lib/supabase-calls/editor-workspace";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { getUserFromCookie } from "@/lib/utils/get-user";
import PolaroidStack from "@/components/blueprint/polaroid-stack";
import WritingLottie from "@/components/blueprint/writing-lottie";

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

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[radial-gradient(oklch(24%_0.022_245)_1px,transparent_1px)] bg-size-[28px_28px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-0">
        {/* ── Hero — mirrors overview page ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 border-b-2 border-primary">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[9px] tracking-[0.24em] uppercase text-muted-foreground/50 mb-3">
              Case Workspace — Blueprints
            </p>
            <h1 className="font-playfair-display text-[clamp(32px,5vw,56px)] font-bold leading-[1.02] tracking-[-0.025em] text-primary mb-4 italic">
              Blueprints
            </h1>
            <p className="noir-text text-[15px] leading-[1.8] text-foreground/65 max-w-xl mb-6">
              Manage and organise your reusable story structures, character
              sheets, and scene templates.
            </p>
            <CreateBlueprintBtns projectId={projectId} />
          </div>

          {/* Lottie + polaroid stack stacked on the right */}
          <div className="shrink-0 flex flex-col items-center gap-4 self-center sm:self-end">
            <WritingLottie />
            {/* <PolaroidStack /> */}
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="border-b border-border">
          <div className="flex flex-wrap">
            <div className="flex flex-col gap-2 px-6 py-5 border-r border-border/60 min-w-[130px]">
              <span className="font-mono text-[8px] tracking-[0.22em] uppercase text-muted-foreground/45">
                Total Blueprints
              </span>
              <span className="font-playfair-display text-[15px] font-bold text-primary leading-none">
                {blueprints?.length ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* ── Blueprint list ── */}
        <div className="pt-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-muted-foreground/50 shrink-0">
              All Blueprints
            </span>
            <div className="flex-1 border-t border-border/50" />
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-muted-foreground/35 shrink-0">
              {blueprints?.length ?? 0}{" "}
              {blueprints?.length === 1 ? "file" : "files"} on record
            </span>
          </div>
          <UserBlueprintsList blueprints={blueprints} projectId={projectId} />
        </div>
      </div>
    </div>
  );
}
