import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "src/auth/auth.guard";
import {
  ApiResponse,
  Contribution,
  MonthlyContributionsResponse,
} from "@detective-quill/shared-types";
import { ContributionsService } from "./contributions.service";
import {
  CreateContributionDto,
  GetMonthlyContributionsQueryDto,
} from "./dto/contributions.dto";

@Controller("/contributions")
@UseGuards(AuthGuard)
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @Post()
  async createContribution(
    @Body() dto: CreateContributionDto,
    @Req() req: any,
  ): Promise<ApiResponse<Contribution>> {
    const userId = req.user.id;
    const data = await this.contributionsService.createContribution(
      userId,
      dto,
    );

    return {
      success: true,
      data,
      message: "Contribution logged successfully",
    };
  }

  @Get("monthly")
  async getMonthlyContributions(
    @Query() query: GetMonthlyContributionsQueryDto,
    @Req() req: any,
  ): Promise<ApiResponse<MonthlyContributionsResponse>> {
    const userId = req.user.id;
    const data = await this.contributionsService.getMonthlyContributions(
      userId,
      query.year,
      query.month,
    );

    return {
      success: true,
      data,
      message: "Monthly contributions fetched successfully",
    };
  }
}
