import BlueprintLanding from "@/components/workspace/blueprint/blueprint-landing";
import { Suspense } from "react";

interface ProjectPageProps {
  params: {
    projectName: string;
  };
}

export default async function BlueprintPage({ params }: ProjectPageProps) {
  const { projectName } = await params;

  return (
    <Suspense fallback={<BlueprintLandingSkeleton />}>
      <BlueprintLanding projectName={projectName} />
    </Suspense>
  );
}

function BlueprintLandingSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center space-y-4">
        <div className="h-12 w-12 bg-muted rounded-full mx-auto animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted rounded mx-auto animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded mx-auto animate-pulse" />
        </div>
      </div>
    </div>
  );
}