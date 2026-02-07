import { Module } from "@nestjs/common";
import { NlpAnalysisService } from "./nlp-analysis.service";
import { NlpAnalysisController } from "./nlp-analysis.controller";
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [SupabaseModule],
  controllers: [NlpAnalysisController],
  providers: [NlpAnalysisService],
  exports: [NlpAnalysisService],
})
export class NlpAnalysisModule {}
