"use client";

import { useState } from "react";
import { toast } from "sonner";
import { supabaseBrowserClient } from "@/supabase/browser-client";
import { DetectiveProfile } from "@/lib/types/profile";

export function useProfileSave() {
  const [isSaving, setIsSaving] = useState(false);

  const saveProfile = async (profile: DetectiveProfile) => {
    setIsSaving(true);
    try {
      const { error } = await supabaseBrowserClient
        .from("profiles")
        .update({
          full_name: profile.full_name,
          username: profile.pen_name,
          bio: profile.bio,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", profile.id);

      if (error) {
        throw error;
      }

      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveProfile,
    isSaving,
  };
}
