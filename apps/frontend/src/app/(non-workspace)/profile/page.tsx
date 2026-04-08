import UserProfile from "@/components/profile/user-profile";
import Heatmap from "@/components/profile/heatmap";
import { getUserFromCookie } from "@/lib/utils/get-user";
import { redirect } from "next/navigation";
import RecentProjects from "@/components/profile/recent-projects";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { getUserProjects } from "@/lib/supabase-calls/user-projects";

export const metadata = {
  title: "My Profile",
};

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
    <div className="relative isolate min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(to_right,oklch(24%_0.022_245)_1px,transparent_1px),linear-gradient(to_bottom,oklch(24%_0.022_245)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute -right-20 top-24 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -left-16 bottom-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 p-3 lg:grid-cols-[420px_1fr]">
        <div className="lg:sticky lg:top-20 lg:self-start">
          <UserProfile />
        </div>
        <div className="flex flex-col gap-6">
          <RecentProjects projects={recentActiveProjects} />
          <Heatmap />
        </div>
      </section>
    </div>
  );
}
