// components/profile/detective-profile-client.tsx - Client Component
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ProfileHeader } from "./profile-header";
import { supabaseBrowserClient } from "@/supabase/browser-client";
import { DetectiveProfile } from "@/lib/types/profile";
import ProfileTabs from "./profile-tabs/profile-tabs";

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
        detective_rank: profile.detective_rank,
        writing_stats: profile.writing_stats,
        achievements: profile.achievements,
        case_files: profile.case_files,
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

  const handleAvatarUpload = (newAvatarUrl: string) => {
    // Avatar upload is handled in ProfileHeader component
    // This callback is triggered after successful upload
    console.log("Avatar updated:", newAvatarUrl);
  };

  const handleProfileUpdate = (updatedProfile: DetectiveProfile) => {
    setProfile(updatedProfile);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="container max-w-6xl mx-auto py-8 space-y-8">
        <ProfileHeader
          profile={profile}
          isEditing={isEditing}
          onEdit={() => setIsEditing(!isEditing)}
          onAvatarUpload={handleAvatarUpload}
          onProfileUpdate={handleProfileUpdate}
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
