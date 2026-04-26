"use client";

import React from "react";
import { Lock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGamification } from "@/hooks/use-gamification";
import type { Badge } from "@detective-quill/shared-types";
import Image from "next/image";

type BadgeDisplayItem = {
  code: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
};

const normalize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const toBadgeDisplayList = (
  allBadges: Badge[],
  earnedBadges: Array<{
    code: string | null;
    name: string | null;
    description: string | null;
    icon: string | null;
  }>,
): BadgeDisplayItem[] => {
  const byCode = new Map<string, BadgeDisplayItem>();

  for (const badge of allBadges) {
    byCode.set(normalize(badge.code || badge.name || ""), {
      code: badge.code || normalize(badge.name || ""),
      name: badge.name || "",
      description: badge.description || "",
      icon: badge.icon || "🏅",
      earned: false,
    });
  }

  for (const badge of earnedBadges) {
    const key = normalize(badge.code || badge.name || "");
    const existing = byCode.get(key);

    if (existing) {
      byCode.set(key, {
        ...existing,
        earned: true,
        icon: badge.icon || existing.icon,
        description: badge.description || existing.description,
        name: badge.name || existing.name,
      });
      continue;
    }

    if (badge.name) {
      byCode.set(key || normalize(badge.name), {
        code: badge.code || normalize(badge.name),
        name: badge.name,
        description: badge.description || "Unlocked achievement badge",
        icon: badge.icon || "🏅",
        earned: true,
      });
    }
  }

  return Array.from(byCode.values());
};

export const GamificationStats = () => {
  const {
    stats,
    earnedBadges,
    allBadges,
    isLoading,
    isLoadingBadges,
    error,
    badgesError,
  } = useGamification();

  const totalXp = Number(stats?.total_xp ?? 0);
  const level = Math.max(1, Math.floor(totalXp / 500) + 1);
  const xpInLevel = totalXp % 500;
  const nextLevelXp = 500;
  const xpProgress = Math.min(100, (xpInLevel / nextLevelXp) * 100);

  const badges = toBadgeDisplayList(
    allBadges,
    earnedBadges.map((badge) => ({
      code: badge.code,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
    })),
  );

  const earnedCount = badges.filter((badge) => badge.earned).length;

  if (isLoading || isLoadingBadges) {
    return (
      <Card className="overflow-hidden border shadow-md rounded-lg">
        <CardContent className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading gamification stats...
        </CardContent>
      </Card>
    );
  }

  if (error || badgesError) {
    return (
      <Card className="overflow-hidden border shadow-md rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between gap-2 text-base">
            <span className="flex items-center gap-2">
              <Image
                src="/gamification.svg"
                alt="Sparkles Icon"
                width={20}
                height={20}
                className="object-contain"
              />
              <h3 className="mystery-title text-primary">Gamification</h3>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-sm text-destructive">
          Failed to load gamification stats: {error || badgesError}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border shadow-md rounded-lg bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <Image
              src="/gamification.svg"
              alt="Sparkles Icon"
              width={30}
              height={30}
              className="object-contain"
            />
            <p className="mystery-title text-primary">Gamification</p>
          </span>
          <span className="rounded-full border border-primary/30 bg-chart-5/30 px-2 py-0.5 text-sm font-medium text-primary">
            {earnedCount}/{badges.length} earned
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-xl border border-primary/20 bg-background/70 p-3">
          <div className="mb-2 flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Total XP
              </p>
              <p className="text-2xl font-bold leading-none text-primary">
                {totalXp}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Level
              </p>
              <p className="text-base font-semibold">{level}</p>
            </div>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary via-primary to-accent transition-all"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {xpInLevel}/{nextLevelXp} XP to next level
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {badges.map((badge) => (
            <div
              key={badge.code}
              className={`group rounded-xl border p-2.5 transition-all ${
                badge.earned
                  ? "border-border bg-primary text-background"
                  : "border-border bg-muted/60 opacity-85"
              }`}
              title={badge.description}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={`text-xl leading-none ${badge.earned ? "" : "grayscale"}`}
                >
                  {badge.icon}
                </span>
                {badge.earned ? (
                  <Image
                    src="/trophy.png"
                    alt="Trophy Icon"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                ) : (
                  <Image
                    src="/lock.png"
                    alt="Lock Icon"
                    width={24}
                    height={24}
                    className="object-contain rounded-full"
                  />
                )}
              </div>
              <p className="line-clamp-1 text-sm font-semibold leading-tight">
                {badge.name}
              </p>
              <p
                className={`line-clamp-4 mt-0.5 text-[11px] ${badge.earned ? "text-secondary" : "text-muted-foreground"}`}
              >
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
