// components/profile/detective-profile-client.tsx - Client Component
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ProfileHeader } from "./profile-header";
import { ProfileTabs } from "./profile-tabs";
import { supabaseBrowserClient } from "@/supabase/browser-client";

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

interface DetectiveProfileClientProps {
  initialProfile: DetectiveProfile;
}

export function DetectiveProfileClient({
  initialProfile,
}: DetectiveProfileClientProps) {
  const [profile, setProfile] = useState<DetectiveProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Save to Supabase
      const { error } = await supabaseBrowserClient.from("profiles").upsert({
        id: profile.id,
        full_name: profile.full_name,
        pen_name: profile.pen_name,
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        detective_rank: profile.detective_rank,
        specialization: profile.specialization,
        writing_stats: profile.writing_stats,
        achievements: profile.achievements,
        case_files: profile.case_files,
        preferences: profile.preferences,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async () => {
    toast.info("Avatar upload coming soon!");
    // TODO: Implement avatar upload functionality
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="container max-w-6xl mx-auto py-8 space-y-8">
        <ProfileHeader
          profile={profile}
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onAvatarUpload={handleAvatarUpload}
        />

        <ProfileTabs
          profile={profile}
          setProfile={setProfile}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onSave={handleSaveProfile}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
