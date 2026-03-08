import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { MembersModule } from "../members/members.module";
import { CommitsService } from "./commits.service";
import { CommitsController } from "./commits.controller";
import { BranchesModule } from "src/branches/branches.module";
import { SnapshotsModule } from "src/snapshots/snapshots.module";
import { ContributionsModule } from "src/contributions/contributions.module";
import { CommitKnowledgeGraphModule } from "src/commit-knowledge-graph/commit-knowledge-graph.module";
import { QueueModule } from "src/queue/queue.module";

@Module({
  imports: [
    SupabaseModule,
    MembersModule,
    BranchesModule,
    SnapshotsModule,
    ContributionsModule,
    CommitKnowledgeGraphModule,
    QueueModule,
  ],
  controllers: [CommitsController],
  providers: [CommitsService],
  exports: [CommitsService],
})
export class CommitsModule {}
