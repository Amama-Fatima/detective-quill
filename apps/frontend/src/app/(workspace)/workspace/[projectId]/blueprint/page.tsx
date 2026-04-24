import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import CreateBlueprintBtns from "@/components/blueprint/btns/create-blueprint-btns";
import { getProjectBlueprints } from "@/lib/supabase-calls/blueprint";
import { UserBlueprintsList } from "@/components/blueprint/user-bueprints-list";
import ErrorMsg from "@/components/error-msg";
import { fetchProjectTitle } from "@/lib/supabase-calls/editor-workspace";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";
import { getUserFromCookie } from "@/lib/utils/get-user";
import { BlueprintIcon } from "@/components/icons/blueprint-icon";
import { useWorkspaceContext } from "@/context/workspace-context";
import PolaroidStack from "@/components/blueprint/polaroid-stack";

interface BlueprintPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
  const { title, error } = await fetchProjectTitle(projectId);
  if (error || !title) {
    return {
      title: "Blueprints",
      description: "Project Blueprints page",
    };
  }
  return {
    title: `${title} - Blueprints`,
    description: `Blueprints page for project ${title}`,
  };
}

export default async function BlueprintPage({ params }: BlueprintPageProps) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();

  const user = await getUserFromCookie();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { blueprints, error } = await getProjectBlueprints(projectId, supabase);

  if (error) {
    return <ErrorMsg message="Failed to load blueprints" />;
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,oklch(24%_0.022_245)_1px,transparent_1px),linear-gradient(to_bottom,oklch(24%_0.022_245)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute -right-20 top-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 border-b border-border bg-muted/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap items-center justify-between mb-6 gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <BlueprintIcon />
              </div>
              <div className="flex flex-col gap-3">
                <h1 className="mystery-title text-4xl mb-2">Blueprints</h1>
                <p className="text-muted-foreground noir-text">
                  Manage and organize your reusable design components and
                  templates
                </p>
                <CreateBlueprintBtns projectId={projectId} />
              </div>
            </div>
            <PolaroidStack />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserBlueprintsList blueprints={blueprints} projectId={projectId} />
      </div>
    </div>
  );
}
