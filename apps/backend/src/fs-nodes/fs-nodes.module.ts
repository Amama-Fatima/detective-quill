import { Module } from "@nestjs/common";
import { FsNodesService } from "./fs-nodes.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { ProjectsModule } from "../projects/projects.module";
import { FsNodesController } from "./fs-nodes.controller";
import { QueueModule } from "src/queue/queue.module";

@Module({
  imports: [SupabaseModule, ProjectsModule, QueueModule],
  controllers: [FsNodesController],
  providers: [FsNodesService],
  exports: [FsNodesService],
})
export class FsNodesModule {}
