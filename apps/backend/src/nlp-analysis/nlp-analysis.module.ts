import { Module } from "@nestjs/common";
import { NlpAnalysisService } from "./nlp-analysis.service";
import { NlpAnalysisController } from "./nlp-analysis.controller";
import { SupabaseModule } from "../supabase/supabase.module";
import { QueueModule } from "../queue/queue.module";

@Module({
  imports: [SupabaseModule, QueueModule],
  controllers: [NlpAnalysisController],
  providers: [NlpAnalysisService],
  exports: [NlpAnalysisService],
})
export class NlpAnalysisModule {}
