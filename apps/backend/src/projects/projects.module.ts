import { Module } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { ProjectsController } from "./projects.controller";
import { SupabaseModule } from "../supabase/supabase.module";
import { BadgesNStatsModule } from "src/badges_n_stats/badges_n_stats.module";
@Module({
  imports: [SupabaseModule, BadgesNStatsModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
