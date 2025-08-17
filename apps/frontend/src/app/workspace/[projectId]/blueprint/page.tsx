import BlueprintLanding from "@/components/blueprint/blueprint-landing";
import { Suspense } from "react";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";

interface BlueprintPageProps {
  params: {
    projectId: string;
  };
}

export default async function BlueprintPage({ params }: BlueprintPageProps) {
  const { projectId } = await params;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;

  return (
    <Suspense fallback={<BlueprintLandingSkeleton />}>
      <BlueprintLanding projectId={projectId} userId={userId} />
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

// Todo: can do?

/**
 * If you want to avoid the extra call to supabase.auth.getUser(),
 * you can use Next.js middleware to attach the user to the request,
 * then access it via cookies or headers in your page.
 *
 * Example (not implemented here):
 * - In middleware, verify the user and set a cookie/header with user info.
 * - In your page, read the user info from the cookie/header instead of calling getUser().
 *
 * This avoids the extra round trip to Supabase for user info.
 */
