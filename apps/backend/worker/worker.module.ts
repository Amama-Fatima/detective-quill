import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EmailConsumer } from "./email.consumer";
import { EmailModule } from "../src/email/email.module";
import { NlpAnalysisConsumer } from "./nlp-analysis.consumer";
import { NlpAnalysisModule } from "src/nlp-analysis/nlp-analysis.module";

@Module({
  imports: [ConfigModule, EmailModule, NlpAnalysisModule],
  controllers: [EmailConsumer, NlpAnalysisConsumer],
})
export class WorkerModule {}
