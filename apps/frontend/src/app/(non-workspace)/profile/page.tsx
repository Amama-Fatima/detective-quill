import UserProfile from "@/components/profile/user-profile";
import Heatmap from "@/components/profile/heatmap";
import { getUserFromCookie } from "@/lib/utils/get-user";
import { redirect } from "next/navigation";
import RecentProjects from "@/components/profile/recent-projects";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { getUserProjects } from "@/lib/supabase-calls/user-projects";

export default async function ProfilePage() {
  const user = await getUserFromCookie();

  if (!user || !user.sub) {
    redirect("/auth/sign-in");
  }

  const supabase = await createSupabaseServerClient();
  const { projects } = await getUserProjects(user.sub, supabase);

  const recentActiveProjects = (projects || [])
    .filter((project) => project.status === "active")
    .sort((a, b) => {
      const bTime = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      const aTime = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 2);

  return (
    <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 p-4 md:p-6 lg:grid-cols-[320px_1fr]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <UserProfile />
      </div>

      <div className="flex flex-col gap-6">
        <RecentProjects projects={recentActiveProjects} />
        <Heatmap />
      </div>
    </section>
  );
}
