import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EmailConsumer } from "./email.consumer";
import { EmailModule } from "../src/email/email.module";
import { AdminSupabaseService } from "../src/supabase/admin-supabase.service";
import { WorkerNlpAnalysisService } from "../src/nlp-analysis/worker-nlp-analysis.service";
import { ManualRabbitMQConsumer } from "./manual-rabbitmq.consumer";

@Module({
  imports: [ConfigModule.forRoot(), EmailModule],
  controllers: [EmailConsumer],
  providers: [
    AdminSupabaseService,
    WorkerNlpAnalysisService,
    ManualRabbitMQConsumer,
  ],
})
export class WorkerModule {}
