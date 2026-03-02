import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { ContributionsController } from "./contributions.controller";
import { ContributionsService } from "./contributions.service";

@Module({
  imports: [SupabaseModule],
  controllers: [ContributionsController],
  providers: [ContributionsService],
  exports: [ContributionsService],
})
export class ContributionsModule {}
