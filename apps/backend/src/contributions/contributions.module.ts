import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { ContributionsController } from "./contributions.controller";
import { ContributionsService } from "./contributions.service";
import { WorkerContributionsService } from "./worker-contributions.service";

@Module({
  imports: [SupabaseModule],
  controllers: [ContributionsController],
  providers: [ContributionsService, WorkerContributionsService],
  exports: [ContributionsService, WorkerContributionsService],
})
export class ContributionsModule {}
