import { Module } from "@nestjs/common";
import { FsNodesService } from "./fs-nodes.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { ProjectsModule } from "../projects/projects.module";
import { FsNodesController } from "./fs-nodes.controller";
import { QueueModule } from "src/queue/queue.module";
import { BranchesModule } from "../branches/branches.module";

@Module({
  imports: [SupabaseModule, ProjectsModule, QueueModule, BranchesModule],
  controllers: [FsNodesController],
  providers: [FsNodesService],
  exports: [FsNodesService],
})
export class FsNodesModule {}
