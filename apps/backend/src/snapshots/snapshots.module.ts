import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { SnapshotsService } from "./snapshots.service";
import { FsNodesModule } from "src/fs-nodes/fs-nodes.module";

@Module({
  imports: [SupabaseModule, FsNodesModule],
  providers: [SnapshotsService],
  exports: [SnapshotsService],
})
export class SnapshotsModule {}