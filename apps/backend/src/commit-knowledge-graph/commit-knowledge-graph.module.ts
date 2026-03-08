import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { SnapshotsModule } from "../snapshots/snapshots.module";
import { QueueModule } from "../queue/queue.module";
import { CommitKnowledgeGraphService } from "./commit-knowledge-graph.service";

@Module({
  imports: [SupabaseModule, SnapshotsModule, QueueModule],
  providers: [CommitKnowledgeGraphService],
  exports: [CommitKnowledgeGraphService],
})
export class CommitKnowledgeGraphModule {}
