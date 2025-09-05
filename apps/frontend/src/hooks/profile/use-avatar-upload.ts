"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabaseBrowserClient } from "@/supabase/browser-client";
import { DetectiveProfile } from "@/lib/types/profile";

export function useAvatarUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const validateFile = (file: File): boolean => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, WebP, or GIF)");
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return false;
    }

    return true;
  };

  const deleteOldAvatar = async (avatarUrl: string) => {
    if (avatarUrl && avatarUrl.includes("supabase")) {
      try {
        const urlParts = avatarUrl.split("/");
        const bucketIndex = urlParts.findIndex((part) => part === "profiles");
        if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
          const oldPath = urlParts.slice(bucketIndex + 1).join("/");
          await supabaseBrowserClient.storage
            .from("profiles")
            .remove([oldPath]);
        }
      } catch (deleteError) {
        console.warn("Failed to delete old avatar:", deleteError);
      }
    }
  };

  const uploadAvatar = async (
    file: File,
    profile: DetectiveProfile
  ): Promise<string | null> => {
    if (!validateFile(file)) return null;

    setUploadingAvatar(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/avatars/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } =
        await supabaseBrowserClient.storage
          .from("profiles")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabaseBrowserClient.storage
        .from("profiles")
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error("Failed to get public URL");
      }

      // Delete old avatar
      await deleteOldAvatar(profile.avatar_url);

      // Update user metadata in Supabase Auth
      const { error: authUpdateError } =
        await supabaseBrowserClient.auth.updateUser({
          data: {
            avatar_url: urlData.publicUrl,
          },
        });

      if (authUpdateError) {
        throw authUpdateError;
      }

      // Update profile in profiles table
      const { error: profileUpdateError } = await supabaseBrowserClient
        .from("profiles")
        .update({
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (profileUpdateError) {
        throw profileUpdateError;
      }

      toast.success("Avatar updated successfully!");
      return urlData.publicUrl;
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error("Failed to upload avatar. Please try again.");
      return null;
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return {
    fileInputRef,
    uploadingAvatar,
    uploadAvatar,
    triggerFileUpload,
  };
}
