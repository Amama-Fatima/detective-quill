import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EmailConsumer } from "./email.consumer";
import { NlpAnalysisConsumer } from "./nlp-analysis.consumer";
import { EmailModule } from "../src/email/email.module";
import { AdminSupabaseService } from "../src/supabase/admin-supabase.service";
import { WorkerNlpAnalysisService } from "../src/nlp-analysis/worker-nlp-analysis.service";

@Module({
  imports: [ConfigModule.forRoot(), EmailModule],
  controllers: [EmailConsumer, NlpAnalysisConsumer],
  providers: [AdminSupabaseService, WorkerNlpAnalysisService],
})
export class WorkerModule {}
