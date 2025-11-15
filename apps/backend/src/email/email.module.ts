import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { SupabaseModule } from "../supabase/supabase.module";
import { EmailService } from "./email.service";
import { InvitationsModule } from "../invitations/invitations.module";
import { QueueModule } from "../queue/queue.module";
import { WorkerEmailService } from "./worker-email.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [SupabaseModule, InvitationsModule, QueueModule, ConfigModule],
  controllers: [EmailController],
  providers: [EmailService, WorkerEmailService],
  exports: [EmailService, WorkerEmailService],
})
export class EmailModule {}
