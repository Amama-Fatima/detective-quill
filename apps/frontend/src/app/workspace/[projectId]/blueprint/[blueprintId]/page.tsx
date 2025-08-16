import { Suspense } from "react";
import Canvas from "@/components/workspace/blueprint/canvas";
import { BlueprintType } from "@detective-quill/shared-types";
import {getUserCardTypes, getDefaultCardTypesForBlueprintType} from "@/lib/supabase-calls/card-types";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/dist/client/components/navigation";

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
  params, searchParams
}: CreateBlueprintPageProps) {
  const { projectId, blueprintId } = await params;
  const type = await searchParams?.type;

    const supabase = await createSupabaseServerClient();  
    const {
      data: { user },
    } = await supabase.auth.getUser();
  
    if (!user) {
      redirect("/login");
    }
  
    const userId = user.id;

    const cardTypes = await getDefaultCardTypesForBlueprintType(supabase, type);
    const userTypes = await getUserCardTypes(supabase, userId, type);

  return (
    <Suspense fallback={<CreateBlueprintPageSkeleton />}>
      <div>
        <h1>Create Blueprint of type: {type} for project: {projectId} </h1>
        <Canvas projectId={projectId} blueprintId={blueprintId} type={type} cardTypes={cardTypes} userTypes={userTypes} />
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
