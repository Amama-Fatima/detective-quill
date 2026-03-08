import { Injectable } from "@nestjs/common";
import { AdminSupabaseService } from "../supabase/admin-supabase.service";
import { BadRequestException } from "@nestjs/common";
import type { Contribution } from "@detective-quill/shared-types";

@Injectable()
export class WorkerContributionsService {
  constructor(private adminSupabaseService: AdminSupabaseService) {}

  private getContributionScore(type: "save" | "commit"): number {
    return type === "commit" ? 5 : 1;
  }

  private async createContribution(
    userId: string,
    contributionType: "save" | "commit",
    referenceId?: string | null,
  ): Promise<Contribution> {
    const supabase = this.adminSupabaseService.client;
    const { data, error } = await supabase
      .from("user_contributions")
      .insert({
        user_id: userId,
        contribution_type: contributionType,
        score: this.getContributionScore(contributionType),
        reference_id: referenceId ?? null,
      })
      .select("*")
      .single();

    if (error) {
      throw new BadRequestException(
        `Failed to create contribution: ${error.message}`,
      );
    }

    return data as Contribution;
  }

  async logCommitContribution(userId: string, referenceId?: string | null) {
    return this.createContribution(userId, "commit", referenceId);
  }
}
