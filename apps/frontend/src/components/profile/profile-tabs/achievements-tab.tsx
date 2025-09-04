// components/profile/tabs/achievements-tab.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Target,
  PenTool,
  Crown,
  Brain,
  Users,
  Clock,
  Lock,
} from "lucide-react";
import { DetectiveProfile } from "@/lib/types/profile";

// Achievement definitions
const achievementData = {
  first_case: {
    name: "First Case Closed",
    description: "Completed your first mystery story",
    icon: Target,
    color: "text-blue-600",
    rarity: "common",
  },
  word_warrior: {
    name: "Word Warrior",
    description: "Written over 100,000 words",
    icon: PenTool,
    color: "text-green-600",
    rarity: "uncommon",
  },
  consistency_crown: {
    name: "Consistency Crown",
    description: "Maintained a 30-day writing streak",
    icon: Crown,
    color: "text-purple-600",
    rarity: "rare",
  },
  plot_twist_master: {
    name: "Plot Twist Master",
    description: "Crafted 50 unexpected revelations",
    icon: Brain,
    color: "text-orange-600",
    rarity: "epic",
  },
  character_creator: {
    name: "Character Creator",
    description: "Developed 25 unique characters",
    icon: Users,
    color: "text-pink-600",
    rarity: "uncommon",
  },
  deadline_detective: {
    name: "Deadline Detective",
    description: "Never missed a writing deadline",
    icon: Clock,
    color: "text-red-600",
    rarity: "legendary",
  },
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common":
      return "border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800";
    case "uncommon":
      return "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20";
    case "rare":
      return "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20";
    case "epic":
      return "border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20";
    case "legendary":
      return "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20";
    default:
      return "border-gray-300 bg-gray-50";
  }
};

interface AchievementsTabProps {
  profile: DetectiveProfile;
}

const AchievementsTab = ({ profile }: AchievementsTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-600" />
            Detective Badges Collection
          </CardTitle>
          <CardDescription>
            Earn badges by completing writing milestones and solving cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profile.achievements.map((achievementId) => {
              const achievement =
                achievementData[achievementId as keyof typeof achievementData];
              const Icon = achievement.icon;

              return (
                <div
                  key={achievementId}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${getRarityColor(
                    achievement.rarity
                  )}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg bg-white/50 ${achievement.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-serif font-semibold">
                          {achievement.name}
                        </h3>
                        <Badge variant="outline" className="text-xs case-file">
                          {achievement.rarity.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Locked Achievement Example */}
            <div className="p-4 rounded-lg border-2 border-dashed border-muted opacity-50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Lock className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif font-semibold text-muted-foreground">
                    Mystery Badge
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Complete 5 more cases to unlock
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementsTab;
