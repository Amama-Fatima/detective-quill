import { Module } from "@nestjs/common";
import { FsNodesService } from "./fs-nodes.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { ProjectsModule } from "../projects/projects.module";
import { FsNodesController } from "./fs-nodes.controller";
import { QueueModule } from "src/queue/queue.module";
import { ContributionsModule } from "src/contributions/contributions.module";
import { WorkerFsNodesService } from "./worker-fs-nodes.service";
import { BadgesNStatsModule } from "src/badges_n_stats/badges_n_stats.module";

@Module({
  imports: [
    SupabaseModule,
    ProjectsModule,
    QueueModule,
    ContributionsModule,
    BadgesNStatsModule,
  ],
  controllers: [FsNodesController],
  providers: [FsNodesService, WorkerFsNodesService],
  exports: [FsNodesService, WorkerFsNodesService],
})
export class FsNodesModule {}
