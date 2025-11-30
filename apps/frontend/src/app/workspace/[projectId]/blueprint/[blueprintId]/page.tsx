import { Suspense } from "react";
import Canvas from "@/components/blueprint/canvas";
import { BlueprintType } from "@detective-quill/shared-types";
import {
  getUserBlueprintById,
  getBlueprintTitle,
} from "@/lib/supabase-calls/blueprint";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/dist/client/components/navigation";
import { getAllCardsOfBlueprint } from "@/lib/supabase-calls/blueprint-cards";
import ErrorMsg from "@/components/error-msg";
import { Metadata } from "next";

export async function generateMetadata({}: {
  params: { projectId: string; blueprintId: string };
}): Promise<Metadata> {
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const userId = user.id;

  const { blueprint, error: blueprintError } = await getUserBlueprintById(
    blueprintId,
    userId,
    supabase
  );
  if (blueprintError || !blueprint) {
    return <ErrorMsg message="Failed to load blueprint data" />;
  }
  const { blueprint_cards, error: cardsError } = await getAllCardsOfBlueprint(
    blueprintId,
    userId,
    supabase
  );

  if (cardsError) {
    return <ErrorMsg message="Failed to load blueprint cards" />;
  }

  return (
    <Suspense fallback={<CreateBlueprintPageSkeleton />}>
      <div>
        <Canvas
          blueprintId={blueprintId}
          type={type}
          projectName={blueprint?.title || "Untitled Blueprint"}
          prevBlueprintCards={blueprint_cards}
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
