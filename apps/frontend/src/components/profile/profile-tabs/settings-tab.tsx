"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Save, ChevronRight } from "lucide-react";
import { DetectiveProfile } from "@/lib/types/profile";

interface SettingsTabProps {
  profile: DetectiveProfile;
  setProfile: (profile: DetectiveProfile) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
}

const SettingsTab = ({
  profile,
  setProfile,
  isEditing,
  setIsEditing,
  onSave,
  isSaving,
}: SettingsTabProps) => {
  const settingsItems = [
    {
      title: "Public Profile",
      description: "Allow other detectives to view your profile",
      category: "privacy",
    },
    {
      title: "Writing Statistics",
      description: "Show your writing progress publicly",
      category: "privacy",
    },
    {
      title: "Notification Preferences",
      description: "Manage email and push notifications",
      category: "notifications",
    },
    {
      title: "Account Security",
      description: "Manage password and security settings",
      category: "security",
    },
    {
      title: "Danger Zone",
      description: "Irreversible and destructive actions",
      category: "danger",
    },
  ];

  const handleFieldChange = (field: keyof DetectiveProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Detective Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile.full_name}
                  onChange={(e) =>
                    handleFieldChange("full_name", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pen_name">Pen Name / Detective Alias</Label>
                <Input
                  id="pen_name"
                  value={profile.pen_name}
                  onChange={(e) =>
                    handleFieldChange("pen_name", e.target.value)
                  }
                  placeholder="Your detective persona"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Detective Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => handleFieldChange("bio", e.target.value)}
                placeholder="Describe your detective writing style and interests..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={onSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your detective profile preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {settingsItems.map((item, index) => {
            const isDanger = item.category === "danger";

            return (
              <div
                key={index}
                className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                  isDanger
                    ? "border-destructive/20 hover:bg-destructive/5"
                    : "border-border hover:bg-accent/5"
                }`}
              >
                <div>
                  <h3
                    className={`font-medium ${
                      isDanger ? "text-destructive" : ""
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className={
                    isDanger
                      ? "border-destructive/30 text-destructive hover:bg-destructive/10"
                      : ""
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
