// components/profile/profile-tabs.tsx
"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DetectiveProfile } from "@/lib/types/profile";
import { OverviewTab } from "./overview-tab";
import AchievementsTab from "./achievements-tab";
import StatisticsTab from "./statistics-tab";
import SettingsTab from "./settings-tab";

interface ProfileTabsProps {
  profile: DetectiveProfile;
  setProfile: (profile: DetectiveProfile) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onSave: () => void;
  isSaving: boolean;
}

const ProfileTabs = ({
  profile,
  setProfile,
  activeTab,
  setActiveTab,
  isEditing,
  setIsEditing,
  onSave,
  isSaving,
}: ProfileTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-4 bg-card/50">
        <TabsTrigger value="overview" className="font-serif">
          Case Overview
        </TabsTrigger>
        <TabsTrigger value="achievements" className="font-serif">
          Detective Badges
        </TabsTrigger>
        <TabsTrigger value="stats" className="font-serif">
          Investigation Stats
        </TabsTrigger>
        <TabsTrigger value="settings" className="font-serif">
          Case Settings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <OverviewTab profile={profile} />
      </TabsContent>

      <TabsContent value="achievements">
        <AchievementsTab profile={profile} />
      </TabsContent>

      <TabsContent value="stats">
        <StatisticsTab profile={profile} />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsTab
          profile={profile}
          setProfile={setProfile}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onSave={onSave}
          isSaving={isSaving}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
