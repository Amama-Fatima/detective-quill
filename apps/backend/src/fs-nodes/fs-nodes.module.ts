import { Module } from "@nestjs/common";
import { FsNodesService } from "./fs-nodes.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { ProjectsModule } from "../projects/projects.module";
import { FsNodesController } from "./fs-nodes.controller";
import { QueueModule } from "src/queue/queue.module";
import { ContributionsModule } from "src/contributions/contributions.module";
import { WorkerFsNodesService } from "./worker-fs-nodes.service";

@Module({
  imports: [SupabaseModule, ProjectsModule, QueueModule, ContributionsModule],
  controllers: [FsNodesController],
  providers: [FsNodesService, WorkerFsNodesService],
  exports: [FsNodesService, WorkerFsNodesService],
})
export class FsNodesModule {}
