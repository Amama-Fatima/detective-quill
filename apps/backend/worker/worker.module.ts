import { Module } from "@nestjs/common";
import { EmailConsumer } from "./email.consumer";
import { EmailModule } from "../src/email/email.module";
import { ConfigModule } from "@nestjs/config";
@Module({
  controllers: [EmailConsumer],
  imports: [EmailModule, ConfigModule],
})
export class WorkerModule {}
