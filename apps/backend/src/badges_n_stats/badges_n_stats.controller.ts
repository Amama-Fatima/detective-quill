import { Controller, UseGuards, Get, Post, Req } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { ApiResponse } from "@detective-quill/shared-types";
import { BadgesNStatsService } from "./badges_n_stats.service";

@Controller("badges")
@UseGuards(AuthGuard)
export class BadgesNStatsController {
  constructor(private readonly badgesNStatsService: BadgesNStatsService) {}

  @Get("me")
  async getMyBadges(@Req() req: any): Promise<ApiResponse<any>> {
    const userId = req.user.id;
    const data = await this.badgesNStatsService.getMyGamification(userId);

    return {
      success: true,
      data,
      message: "Gamification summary fetched successfully",
    };
  }

  @Post("evaluate")
  async evaluate(@Req() req: any): Promise<ApiResponse<any>> {
    const userId = req.user.id;
    const data = await this.badgesNStatsService.evaluateAndAward(userId);

    return {
      success: true,
      data,
      message: "Badge evaluation completed",
    };
  }
}
