import { Suspense } from "react";

interface CreateBlueprintPageProps {
  params: {
    projectName: string;
    type: string;
  };
}

export default async function CreateBlueprintPage({
  params,
}: CreateBlueprintPageProps) {
  const { projectName, type } = await params;

  return (
    <Suspense fallback={<CreateBlueprintPageSkeleton />}>
      <div>
        <h1>Create Blueprint of type: {type} for project: {projectName} </h1>
        {/* Add your form or component to create the blueprint here */}
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
