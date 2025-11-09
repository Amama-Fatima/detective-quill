import { redirect } from "next/navigation";
import { ProjectsPageClient } from "@/components/projects/project-page-client";
import { createSupabaseServerClient } from "@/supabase/server-client";

export default async function CasesPage() {
  const supabase = await createSupabaseServerClient();

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Redirect to sign-in if not authenticated
  if (authError || !user) {
    redirect("/auth/sign-in");
  }

  // Fetch cases server-side
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .eq("author_id", user.id)
    .order("updated_at", { ascending: false });

  if (projectsError) {
    console.error("Error fetching projects:", projectsError);
    // You might want to handle this error differently
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-red-600">Error</h1>
          <p className="text-gray-600 mt-2">Failed to load projects</p>
        </div>
      </div>
    );
  }

  return <ProjectsPageClient user={user} initialProjects={projects || []} />;
}
