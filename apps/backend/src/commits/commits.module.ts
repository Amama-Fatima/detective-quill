import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { MembersModule } from "../members/members.module";
import { CommitsController } from "./commits.controller";
import { BranchesModule } from "src/branches/branches.module";
import { SnapshotsModule } from "src/snapshots/snapshots.module";
import { ContributionsModule } from "src/contributions/contributions.module";
import { QueueModule } from "src/queue/queue.module";
import { WorkerCommitsService } from "./worker-commits.service";

@Module({
  imports: [
    SupabaseModule,
    MembersModule,
    BranchesModule,
    SnapshotsModule,
    ContributionsModule,
    QueueModule,
  ],
  controllers: [CommitsController],
  providers: [WorkerCommitsService],
  exports: [WorkerCommitsService],
})
export class CommitsModule {}
