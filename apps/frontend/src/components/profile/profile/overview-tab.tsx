// components/profile/tabs/overview-tab.tsx
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Shield, FileText, Clock, Flame } from "lucide-react";
import { DetectiveProfile } from "@/lib/types/profile";

interface OverviewTabProps {
  profile: DetectiveProfile;
}

export function OverviewTab({ profile }: OverviewTabProps) {
  const todaysProgress = Math.min(
    (1247 / profile.writing_stats.daily_target) * 100,
    100
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Progress */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Today's Investigation Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Daily Writing Target</span>
                <span className="font-mono">
                  1,247 / {profile.writing_stats.daily_target.toLocaleString()}
                </span>
              </div>
              <Progress value={todaysProgress} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span>{profile.writing_stats.writing_streak} day streak</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>2h 34m active today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detective Specialization */}
        <Card className="border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" />
              Detective Specialization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Detective Rank</span>
                <span className="font-medium text-primary">
                  {profile.detective_rank}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Case Statistics */}
        <Card className="border-green-500/20 md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              Case File Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {profile.case_files.solved}
                </div>
                <div className="text-sm text-muted-foreground case-file">
                  Cases Solved
                </div>
                <div className="text-xs text-green-600 mt-1">+2 this month</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent mb-2">
                  {profile.case_files.active_investigations}
                </div>
                <div className="text-sm text-muted-foreground case-file">
                  Active Cases
                </div>
                <div className="text-xs text-accent mt-1">In progress</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {profile.case_files.cold_cases}
                </div>
                <div className="text-sm text-muted-foreground case-file">
                  Cold Cases
                </div>
                <div className="text-xs text-blue-600 mt-1">On hold</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
