import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { BadgesNStatsController } from "./badges_n_stats.controller";
import { BadgesNStatsService } from "./badges_n_stats.service";

@Module({
  imports: [SupabaseModule],
  providers: [BadgesNStatsService],
  controllers: [BadgesNStatsController],
  exports: [BadgesNStatsService],
})
export class BadgesNStatsModule {}
