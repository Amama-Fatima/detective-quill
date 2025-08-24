import { Suspense } from "react";
import Canvas from "@/components/blueprint/canvas";
import { BlueprintType } from "@detective-quill/shared-types";
import {
  getUserCardTypes,
  getDefaultCardTypesForBlueprintType,
} from "@/lib/supabase-calls/card-types";
import { getUserBlueprintById } from "@/lib/supabase-calls/blueprint";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/dist/client/components/navigation";
import { getAllCardsOfBlueprint } from "@/lib/supabase-calls/blueprint-cards";

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
  const { projectId, blueprintId } = await params;
  const type = await searchParams?.type;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const userId = user.id;

  const cardTypes = await getDefaultCardTypesForBlueprintType(supabase, type);
  const userTypes = await getUserCardTypes(supabase, userId, type);
  const blueprint = await getUserBlueprintById(blueprintId, userId);
  const blueprintCards = await getAllCardsOfBlueprint(
    supabase,
    blueprintId,
    userId
  );

  console.log("These are use types from the page", userTypes);

  return (
    <Suspense fallback={<CreateBlueprintPageSkeleton />}>
      <div>
        <Canvas
          blueprintId={blueprintId}
          type={type}
          cardTypes={cardTypes}
          userTypes={userTypes}
          userId={userId}
          projectName={blueprint?.title || "Untitled Blueprint"}
          prevBlueprintCards={blueprintCards}
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
