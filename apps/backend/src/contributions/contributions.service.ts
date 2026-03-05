import { BadRequestException, Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { CreateContributionDto } from "./dto/contributions.dto";
import type {
  Contribution,
  Database,
  MonthlyContributionsResponse,
} from "@detective-quill/shared-types";

@Injectable()
export class ContributionsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private getContributionScore(type: "save" | "commit"): number {
    return type === "commit" ? 5 : 1;
  }

  private toIsoDateOnly(input: Date): string {
    return input.toISOString().split("T")[0];
  }

  private buildMonthDays(year: number, month: number): string[] {
    const totalDays = new Date(year, month, 0).getDate();
    const days: string[] = [];

    for (let day = 1; day <= totalDays; day += 1) {
      const date = new Date(Date.UTC(year, month - 1, day));
      days.push(this.toIsoDateOnly(date));
    }

    return days;
  }

  async createContribution(
    userId: string,
    dto: CreateContributionDto,
  ): Promise<Contribution> {
    const supabase = this.supabaseService.client;
    const score = this.getContributionScore(dto.contribution_type);

    const { data, error } = await supabase
      .from("user_contributions")
      .insert({
        user_id: userId,
        contribution_type: dto.contribution_type,
        score,
        reference_id: dto.reference_id ?? null,
        contribution_date: dto.contribution_date,
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

  async logSaveContribution(
    userId: string,
    referenceId?: string | null,
  ) {
    return this.createContribution(
      userId,
      {
        contribution_type: "save",
        reference_id: referenceId ?? undefined,
      },
    );
  }

  async logCommitContribution(
    userId: string,
    referenceId?: string | null,
  ) {
    return this.createContribution(
      userId,
      {
        contribution_type: "commit",
        reference_id: referenceId ?? undefined,
      },
    );
  }

  async getMonthlyContributions(
    userId: string,
    year: number,
    month: number,
  ): Promise<MonthlyContributionsResponse> {
    const supabase = this.supabaseService.client;

    const { data, error } = await supabase.rpc(
      "get_user_contributions_monthly",
      {
        p_user_id: userId,
        p_year: year,
        p_month: month,
      },
    );

    if (error) {
      throw new BadRequestException(
        `Failed to fetch monthly contributions: ${error.message}`,
      );
    }

    const rows =
      (data as Database["public"]["Functions"]["get_user_contributions_monthly"]["Returns"]) ||
      [];
    const scoreByDate = new Map(
      rows.map((item) => [item.date, item.total_score]),
    );
    const days = this.buildMonthDays(year, month).map((date) => ({
      date,
      total_score: scoreByDate.get(date) ?? 0,
    }));

    return {
      year,
      month,
      days,
    };
  }
}
