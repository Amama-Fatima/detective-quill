import { Suspense } from "react";
import Canvas from "@/components/blueprint/canvas/canvas";
import { BlueprintType } from "@detective-quill/shared-types";
import { getProjectBlueprintById } from "@/lib/supabase-calls/blueprint";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/dist/client/components/navigation";
import { getAllCardsOfBlueprint } from "@/lib/supabase-calls/blueprint-cards";
import ErrorMsg from "@/components/error-msg";
import { Metadata } from "next";
import { getProjectStatusAndAuthor } from "@/lib/supabase-calls/user-projects";
import { getUserFromCookie } from "@/lib/utils/get-user";

export async function generateMetadata({}: {}): Promise<Metadata> {
  return {
    title: "Create Blueprint",
    description: "Create or Edit Blueprint page",
  };
}

interface CreateBlueprintPageProps {
  params: {
    projectId: string;
    blueprintId: string;
  };
  searchParams: {
    [key: string]: BlueprintType;
  };
}

export default async function CreateBlueprintPage({
  params,
  searchParams,
}: CreateBlueprintPageProps) {
  const { blueprintId } = await params;
  const type = await searchParams?.type;

  const supabase = await createSupabaseServerClient();
  const user = await getUserFromCookie();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const userId = user.sub;

  const { blueprint, error: blueprintError } = await getProjectBlueprintById(
    blueprintId,
    params.projectId,
    supabase,
  );
  if (blueprintError || !blueprint) {
    return <ErrorMsg message="Failed to load blueprint data" />;
  }
  const { blueprint_cards, error: cardsError } = await getAllCardsOfBlueprint(
    blueprintId,
    supabase,
  );

  if (cardsError) {
    return <ErrorMsg message="Failed to load blueprint cards" />;
  }

  const { isActive, author_id } = await getProjectStatusAndAuthor(
    String(blueprint.project_id),
    supabase,
  );

  const isOwner = author_id === userId;

  return (
    <Suspense fallback={<CreateBlueprintPageSkeleton />}>
      <div>
        <Canvas
          blueprintId={blueprintId}
          type={type}
          projectName={blueprint?.title || "Untitled Blueprint"}
          prevBlueprintCards={blueprint_cards}
          isOwner={isOwner}
          isActive={isActive}
          projectId={String(blueprint.project_id)}
        />
      </div>
    </Suspense>
  );
}

function CreateBlueprintPageSkeleton() {
  return (
    <div>
      <h1>Loading Blueprint...</h1>
    </div>
  );
}
