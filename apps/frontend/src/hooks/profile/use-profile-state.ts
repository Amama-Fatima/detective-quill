"use client";

import { useState } from "react";
import { DetectiveProfile } from "@/lib/types/profile";

export function useProfileState(initialProfile: DetectiveProfile) {
  const [profile, setProfile] = useState<DetectiveProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleProfileUpdate = (updatedProfile: DetectiveProfile) => {
    setProfile(updatedProfile);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return {
    profile,
    setProfile,
    isEditing,
    setIsEditing,
    activeTab,
    setActiveTab,
    handleProfileUpdate,
    toggleEdit,
  };
}
