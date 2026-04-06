import { Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { type CreateEventDto } from "@detective-quill/shared-types";
@Injectable()
export class BadgesNStatsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private satisfiesOperator(
    value: number,
    operator: string,
    threshold: number,
  ): boolean {
    switch (operator) {
      case ">":
        return value > threshold;
      case ">=":
        return value >= threshold;
      case "=":
      case "==":
        return value === threshold;
      case "<=":
        return value <= threshold;
      case "<":
        return value < threshold;
      default:
        return false;
    }
  }

  private async getEarnedBadges(userId: string) {
    const supabase = this.supabaseService.client;

    const { data: earnedRows, error: earnedError } = await supabase
      .from("user_badges")
      .select("badge_id, created_at")
      .eq("user_id", userId);

    if (earnedError) {
      throw new Error(`Failed to fetch earned badges: ${earnedError.message}`);
    }

    const badgeIds = (earnedRows ?? []).map((row) => row.badge_id);

    let badgesById = new Map<number, any>();
    if (badgeIds.length > 0) {
      const { data: badges, error: badgesError } = await supabase
        .from("badges")
        .select("id, code, name, description, icon")
        .in("id", badgeIds);

      if (badgesError) {
        throw new Error(
          `Failed to fetch badge details: ${badgesError.message}`,
        );
      }

      badgesById = new Map((badges ?? []).map((badge) => [badge.id, badge]));
    }

    const earnedBadges = (earnedRows ?? [])
      .map((row) => ({
        ...badgesById.get(row.badge_id),
        earned_at: row.created_at,
      }))
      .filter((badge) => Boolean(badge.id));

    return earnedBadges;
  }

  async getMyGamification(userId: string) {
    const supabase = this.supabaseService.client;

    const { data: stats, error: statsError } = await supabase
      .from("game_stats")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (statsError) {
      throw new Error(`Failed to fetch game stats: ${statsError.message}`);
    }

    const earnedBadges = await this.getEarnedBadges(userId);

    return {
      stats,
      earnedBadges,
    };
  }

  async increaseProjectsInvitedTo(userId: string) {
    const supabase = this.supabaseService.client;
    const { data: currentStats, error: statsFetchError } = await supabase
      .from("game_stats")
      .select("projects_invited_to")
      .eq("user_id", userId)
      .single();

    if (statsFetchError) {
      throw new Error(
        `Failed to fetch invited user's stats: ${statsFetchError.message}`,
      );
    }

    const nextProjectsInvitedTo =
      Number(currentStats?.projects_invited_to ?? 0) + 1;

    const { error: statsUpdateError } = await supabase
      .from("game_stats")
      .update({ projects_invited_to: nextProjectsInvitedTo })
      .eq("user_id", userId);

    if (statsUpdateError) {
      throw new Error(
        `Failed to increment invited project count: ${statsUpdateError.message}`,
      );
    }

    return;
  }

  async createEvent(event: CreateEventDto) {
    const supabase = this.supabaseService.client;
    const { error } = await supabase.from("events").insert(event);
    if (error) {
      throw new Error(`Failed to log event: ${error.message}`);
    }
  }

  async updateTotalXp(userId: string, xpDelta: number) {
    const supabase = this.supabaseService.client;

    const { data: currentStats, error: statsFetchError } = await supabase
      .from("game_stats")
      .select("total_xp")
      .eq("user_id", userId)
      .single();

    if (statsFetchError) {
      throw new Error(`Failed to fetch user stats: ${statsFetchError.message}`);
    }

    const nextTotalXp = Number(currentStats?.total_xp ?? 0) + xpDelta;

    const { error: statsUpdateError } = await supabase
      .from("game_stats")
      .update({ total_xp: nextTotalXp })
      .eq("user_id", userId);

    if (statsUpdateError) {
      throw new Error(`Failed to update total XP: ${statsUpdateError.message}`);
    }
  }

  async evaluateAndAward(userId: string) {
    const supabase = this.supabaseService.client;

    const snapshot = await this.getMyGamification(userId);
    const stats = snapshot.stats;

    const metricValues: Record<string, number> = {
      total_xp: Number(stats?.total_xp ?? 0),
      projects_created: Number(stats?.projects_created ?? 0),
      projects_invited_to: Number(stats?.projects_invited_to ?? 0),
      words_written: Number(stats?.words_written ?? 0),
    };

    const { data: criteria, error: criteriaError } = await supabase
      .from("badge_criteria")
      .select("badge_id, metric_key, operator, threshold");

    if (criteriaError) {
      throw new Error(
        `Failed to fetch badge criteria: ${criteriaError.message}`,
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from("user_badges")
      .select("badge_id")
      .eq("user_id", userId);

    if (existingError) {
      throw new Error(`Failed to fetch user badges: ${existingError.message}`);
    }

    const earnedSet = new Set((existing ?? []).map((row) => row.badge_id));

    const newlyEarnedBadgeIds = new Set<number>();
    for (const rule of criteria ?? []) {
      const metricValue = metricValues[rule.metric_key] ?? 0;
      const shouldAward = this.satisfiesOperator(
        metricValue,
        rule.operator,
        Number(rule.threshold),
      );

      if (shouldAward && !earnedSet.has(rule.badge_id)) {
        newlyEarnedBadgeIds.add(rule.badge_id);
      }
    }

    if (newlyEarnedBadgeIds.size > 0) {
      const rows = Array.from(newlyEarnedBadgeIds).map((badgeId) => ({
        user_id: userId,
        badge_id: badgeId,
      }));

      const { error: insertError } = await supabase
        .from("user_badges")
        .insert(rows);

      if (insertError) {
        throw new Error(`Failed to award badges: ${insertError.message}`);
      }
    }

    const { data: awardedBadges, error: awardedError } = await supabase
      .from("badges")
      .select("id, code, name, description, icon")
      .in("id", Array.from(newlyEarnedBadgeIds));

    if (awardedError) {
      throw new Error(
        `Failed to fetch awarded badges: ${awardedError.message}`,
      );
    }

    return {
      awardedCount: newlyEarnedBadgeIds.size,
      awardedBadges: awardedBadges ?? [],
      metrics: metricValues,
    };
  }
}
