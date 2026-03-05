import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { SnapshotsService } from "./snapshots.service";
import { FsNodesModule } from "src/fs-nodes/fs-nodes.module";
import { WorkerSnapshotsService } from "./worker-snapshots.service";

@Module({
  imports: [SupabaseModule, FsNodesModule],
  providers: [SnapshotsService, WorkerSnapshotsService],
  exports: [SnapshotsService, WorkerSnapshotsService],
})
export class SnapshotsModule {}
