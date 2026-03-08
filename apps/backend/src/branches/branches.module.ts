import { Module } from "@nestjs/common";
import { BranchesController } from "./branches.controller";
import { BranchesService } from "./branches.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { ProjectsModule } from "../projects/projects.module";
import { SnapshotsModule } from "src/snapshots/snapshots.module";
import { WorkerBranchesService } from "./worker-branches.service";

@Module({
  imports: [SupabaseModule, ProjectsModule, SnapshotsModule],
  controllers: [BranchesController],
  providers: [BranchesService, WorkerBranchesService],
  exports: [BranchesService, WorkerBranchesService],
})
export class BranchesModule {}
