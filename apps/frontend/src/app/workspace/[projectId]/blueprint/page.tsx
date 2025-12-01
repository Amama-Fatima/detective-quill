import { Suspense } from "react";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { redirect } from "next/navigation";
import CreateBlueprintBtns from "@/components/blueprint/create-blueprint-btns";
import {
  getProjectBlueprintById,
  getProjectBlueprints,
} from "@/lib/supabase-calls/blueprint";
import { UserBlueprintsList } from "@/components/blueprint/user-bueprints-list";
import { getProjectStatusAndAuthor } from "@/lib/supabase-calls/user-projects";
import ErrorMsg from "@/components/error-msg";
import { fetchProjectTitle } from "@/lib/supabase-calls/editor-workspace";
import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

interface BlueprintPageProps {
  params: {
    projectId: string;
  };
}

export async function generateMetadata({
  params,
}: {
  params: { projectId: string };
}): Promise<Metadata> {
  const { projectId } = params;
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const userId = user.id;

  const { blueprints, error } = await getProjectBlueprints(projectId, supabase);

  if (error) {
    return <ErrorMsg message="Failed to load blueprints" />;
  }

  const { isActive, author_id } = await getProjectStatusAndAuthor(
    projectId,
    supabase
  );

  const isOwner = author_id === userId;

  return (
    <Suspense fallback={<BlueprintLandingSkeleton />}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="mystery-title text-3xl font-bold">Blueprints</h2>
              <p className="noir-text mt-2">
                Manage and organize your reusable design components and
                templates
              </p>
            </div>
            {isOwner && isActive && (
              <CreateBlueprintBtns projectId={projectId} />
            )}
          </div>
        </div>

        {/* Blueprints List */}
        <UserBlueprintsList blueprints={blueprints} projectId={projectId} />
      </div>
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
