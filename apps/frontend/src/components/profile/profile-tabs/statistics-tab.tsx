// components/profile/tabs/statistics-tab.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity } from "lucide-react";
import { DetectiveProfile } from "@/lib/types/profile";

interface StatisticsTabProps {
  profile: DetectiveProfile;
}

const StatisticsTab = ({ profile }: StatisticsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Writing Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Words Written</span>
                <span className="font-mono font-bold">
                  {profile.writing_stats.total_words.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Stories Completed</span>
                <span className="font-bold">
                  {profile.writing_stats.completed_stories}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Current Writing Streak</span>
                <span className="font-bold text-orange-600">
                  {profile.writing_stats.writing_streak} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Daily Words</span>
                <span className="font-mono">
                  {Math.round(
                    profile.writing_stats.total_words /
                      (profile.writing_stats.writing_streak || 1)
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Completed "Murder at Midnight" - 2 hours ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Started new case "The Missing Heir" - Yesterday</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Earned "Plot Twist Master" badge - 3 days ago</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>Hit 15-day writing streak - 1 week ago</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsTab;
