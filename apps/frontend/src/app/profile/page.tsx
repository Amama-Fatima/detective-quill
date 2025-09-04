// app/profile/page.tsx - Server Component
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { DetectiveProfileClient } from "@/components/profile/detective-profile";
import { DetectiveProfile } from "@/lib/types/profile";

export default async function ProfilePage() {
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
  console.log("user in page is", user);

  // Fetch profile data from database
  // In a real implementation, you'd fetch from your profiles table
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Mock profile data for now - in real app, use profileData
  const profile: DetectiveProfile = {
    id: user.id,
    email: user.email || "",
    full_name: user.user_metadata?.full_name,
    pen_name: profileData?.username,
    bio: profileData?.bio || "",
    avatar_url: user.user_metadata?.avatar_url || "",
    detective_rank: profileData?.detective_rank || "Senior Detective",
    joined_date: user.created_at || new Date().toISOString(),
    writing_stats: profileData?.writing_stats || {
      total_words: 245670,
      completed_stories: 8,
      active_cases: 3,
      writing_streak: 15,
      daily_target: 1500,
    },
    achievements: profileData?.achievements || [
      "first_case",
      "word_warrior",
      "consistency_crown",
      "plot_twist_master",
      "character_creator",
      "deadline_detective",
    ],
    case_files: profileData?.case_files || {
      solved: 8,
      cold_cases: 2,
      active_investigations: 3,
    },
  };

  if (profileError && profileError.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("Error fetching profile:", profileError);
    // Handle error - could show error page or use default values
  }

  return <DetectiveProfileClient initialProfile={profile} />;
}
