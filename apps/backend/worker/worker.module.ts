import { Module } from "@nestjs/common";
import { EmailConsumer } from "./email.consumer";
import { EmailModule } from "src/email/email.module";

@Module({
  controllers: [EmailConsumer],
  imports: [EmailModule],
})
export class WorkerModule {}
