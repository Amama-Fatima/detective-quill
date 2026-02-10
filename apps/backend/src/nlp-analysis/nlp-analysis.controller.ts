// src/modules/nlp-analysis/nlp-analysis.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { NlpAnalysisService } from "./nlp-analysis.service";
import { AuthGuard } from "../auth/auth.guard";
import {
  AnalysisResponseDto,
  JobStatusDto,
  AnalysisResultDto,
} from "./dto/nlp-analysis.dto";
import { SubmitAnalysisDto } from "./dto/nlp-analysis.dto";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

@Controller("nlp-analysis")
@UseGuards(AuthGuard)
export class NlpAnalysisController {
  constructor(private readonly nlpAnalysisService: NlpAnalysisService) {}

  @Post("submit")
  async submitAnalysis(
    @Body() submitAnalysisDto: SubmitAnalysisDto,
    @Request() req,
  ): Promise<ApiResponse<AnalysisResponseDto>> {
    const data = await this.nlpAnalysisService.submitJob(
      submitAnalysisDto,
      req.user.id,
    );
    return { success: true, data };
  }

  @Get("status/:jobId")
  async getStatus(
    @Param("jobId") jobId: string,
    @Request() req,
  ): Promise<ApiResponse<JobStatusDto>> {
    const data = await this.nlpAnalysisService.getJobStatus(jobId, req.user.id);
    return { success: true, data };
  }

  @Get("results/:jobId")
  async getResults(
    @Param("jobId") jobId: string,
    @Request() req,
  ): Promise<ApiResponse<AnalysisResultDto>> {
    const data = await this.nlpAnalysisService.getResults(jobId, req.user.id);
    return { success: true, data };
  }

  @Get("history")
  async getUserHistory(@Request() req): Promise<ApiResponse<JobStatusDto[]>> {
    const data = await this.nlpAnalysisService.getUserHistory(req.user.id);
    return { success: true, data };
  }
}
