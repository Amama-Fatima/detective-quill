import { Module } from "@nestjs/common";
import { EmailController } from "./email.controller";
import { SupabaseModule } from "../supabase/supabase.module";
import { EmailService } from "./email.service";

@Module({
  imports: [SupabaseModule],
  controllers: [EmailController],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
