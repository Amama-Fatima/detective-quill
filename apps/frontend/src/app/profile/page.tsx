// app/profile/page.tsx - Server Component
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/supabase/server-client";
import { DetectiveProfileClient } from "@/components/profile/detective-profile";

interface DetectiveProfile {
  id: string;
  email: string;
  full_name: string;
  pen_name: string;
  bio: string;
  location: string;
  website: string;
  avatar_url: string;
  detective_rank: string;
  specialization: string;
  joined_date: string;
  writing_stats: {
    total_words: number;
    completed_stories: number;
    active_cases: number;
    writing_streak: number;
    favorite_genre: string;
    daily_target: number;
  };
  achievements: string[];
  case_files: {
    solved: number;
    cold_cases: number;
    active_investigations: number;
  };
  preferences: {
    theme: string;
    notifications: boolean;
    public_profile: boolean;
    show_stats: boolean;
  };
}

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
    full_name: user.user_metadata?.full_name || "Detective Writer",
    pen_name: profileData?.pen_name || "A. Christie Detective",
    bio:
      profileData?.bio ||
      "Crafting intricate mysteries where every clue matters and every character has secrets to hide.",
    location: profileData?.location || "London, England",
    website: profileData?.website || "https://mysterysolver.com",
    avatar_url: user.user_metadata?.avatar_url || "",
    detective_rank: profileData?.detective_rank || "Senior Detective",
    specialization: profileData?.specialization || "Locked Room Mysteries",
    joined_date: user.created_at || new Date().toISOString(),
    writing_stats: profileData?.writing_stats || {
      total_words: 245670,
      completed_stories: 8,
      active_cases: 3,
      writing_streak: 15,
      favorite_genre: "Cozy Mystery",
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
    preferences: profileData?.preferences || {
      theme: "dark",
      notifications: true,
      public_profile: true,
      show_stats: true,
    },
  };

  if (profileError && profileError.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("Error fetching profile:", profileError);
    // Handle error - could show error page or use default values
  }

  return <DetectiveProfileClient initialProfile={profile} />;
}
