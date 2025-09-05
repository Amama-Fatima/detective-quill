"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Edit, Calendar, Mail, Loader2 } from "lucide-react";
import { DetectiveProfile } from "@/lib/types/profile";
import { useAvatarUpload } from "@/hooks/profile/use-avatar-upload";

interface ProfileHeaderProps {
  profile: DetectiveProfile;
  isEditing: boolean;
  onEdit: () => void;
  onAvatarUpload: (newAvatarUrl: string) => void;
  onProfileUpdate: (updatedProfile: DetectiveProfile) => void;
}

export function ProfileHeader({
  profile,
  isEditing,
  onEdit,
  onAvatarUpload,
  onProfileUpdate,
}: ProfileHeaderProps) {
  const { fileInputRef, uploadingAvatar, uploadAvatar, triggerFileUpload } =
    useAvatarUpload();

  const memberSince = new Date(profile.joined_date).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
    }
  );

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const newAvatarUrl = await uploadAvatar(file, profile);
    if (newAvatarUrl) {
      const updatedProfile = {
        ...profile,
        avatar_url: newAvatarUrl,
      };
      onProfileUpdate(updatedProfile);
      onAvatarUpload(newAvatarUrl);
    }
  };

  return (
    <Card className="relative overflow-hidden border-primary/20 shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/10"></div>
      <CardContent className="relative p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar Section */}
          <div className="relative group">
            <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-2xl group-hover:border-primary/40 transition-colors">
              <AvatarImage
                src={profile.avatar_url}
                alt={profile.full_name}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-4xl font-serif font-bold">
                {profile.full_name?.charAt(0) ||
                  profile.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <Button
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              onClick={triggerFileUpload}
              disabled={uploadingAvatar}
            >
              {uploadingAvatar ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="mystery-title text-4xl">
                  {profile.pen_name || profile.full_name}
                </h1>
                <Badge className="bg-primary/10 text-primary border-primary/30 case-file">
                  {profile.detective_rank}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {memberSince}</span>
                </div>
              </div>

              <p className="noir-text text-muted-foreground max-w-2xl">
                {profile.bio}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-card/50 rounded-lg border border-primary/10">
                <div className="text-2xl font-bold text-primary">
                  {profile.case_files.solved}
                </div>
                <div className="text-xs text-muted-foreground case-file">
                  Cases Solved
                </div>
              </div>
              <div className="text-center p-3 bg-card/50 rounded-lg border border-accent/10">
                <div className="text-2xl font-bold text-accent">
                  {profile.writing_stats.writing_streak}
                </div>
                <div className="text-xs text-muted-foreground case-file">
                  Day Streak
                </div>
              </div>
              <div className="text-center p-3 bg-card/50 rounded-lg border border-green-500/10">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(profile.writing_stats.total_words / 1000)}K
                </div>
                <div className="text-xs text-muted-foreground case-file">
                  Words Written
                </div>
              </div>
              <div className="text-center p-3 bg-card/50 rounded-lg border border-blue-500/10">
                <div className="text-2xl font-bold text-blue-600">
                  {profile.achievements.length}
                </div>
                <div className="text-xs text-muted-foreground case-file">
                  Badges Earned
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={onEdit}
              variant={isEditing ? "secondary" : "outline"}
              className="border-primary/30 hover:bg-primary/10"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
