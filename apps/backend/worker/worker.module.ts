import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EmailConsumer } from "./email.consumer";
import { EmailModule } from "../src/email/email.module";
import { AdminSupabaseService } from "../src/supabase/admin-supabase.service";
import { WorkerNlpAnalysisService } from "../src/nlp-analysis/worker-nlp-analysis.service";
import { ManualRabbitMQConsumer } from "./manual-rabbitmq.consumer";
import { CommitsConsumer } from "./commits.consumer";
import { CommitsModule } from "src/commits/commits.module";
import { BranchesModule } from "src/branches/branches.module";

@Module({
  imports: [ConfigModule.forRoot(), EmailModule, CommitsModule, BranchesModule],
  controllers: [EmailConsumer, CommitsConsumer],
  providers: [
    AdminSupabaseService,
    WorkerNlpAnalysisService,
    ManualRabbitMQConsumer,
  ],
})
export class WorkerModule {}
