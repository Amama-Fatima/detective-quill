"use client";

import React from "react";
import { ProfileHeader } from "./profile-header";
import { DetectiveProfile } from "@/lib/types/profile";
import ProfileTabs from "./profile-tabs/profile-tabs";
import { useProfileState } from "@/hooks/profile/use-profile-state";
import { useProfileSave } from "@/hooks/profile/use-profile-save";

interface DetectiveProfileClientProps {
  initialProfile: DetectiveProfile;
}

export function DetectiveProfileClient({
  initialProfile,
}: DetectiveProfileClientProps) {
  const {
    profile,
    setProfile,
    isEditing,
    setIsEditing,
    activeTab,
    setActiveTab,
    handleProfileUpdate,
    toggleEdit,
  } = useProfileState(initialProfile);

  const { saveProfile, isSaving } = useProfileSave();

  const handleSaveProfile = async () => {
    const result = await saveProfile(profile);
    if (result.success) {
      setIsEditing(false);
    }
  };

  const handleAvatarUpload = (newAvatarUrl: string) => {
    // Avatar upload is handled in ProfileHeader component
    // This callback is triggered after successful upload
    console.log("Avatar updated:", newAvatarUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card">
      <div className="container max-w-6xl mx-auto py-8 space-y-8">
        <ProfileHeader
          profile={profile}
          isEditing={isEditing}
          onEdit={toggleEdit}
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
