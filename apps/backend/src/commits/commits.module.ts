import { Module } from "@nestjs/common";
import { SupabaseModule } from "../supabase/supabase.module";
import { MembersModule } from "../members/members.module";
import { CommitsService } from "./commits.service";
import { CommitsController } from "./commits.controller";
import { BranchesModule } from "src/branches/branches.module";
import { SnapshotsModule } from "src/snapshots/snapshots.module";

@Module({
  imports: [SupabaseModule, MembersModule, BranchesModule, SnapshotsModule],
  controllers: [CommitsController],
  providers: [CommitsService],
  exports: [CommitsService],
    })
export class CommitsModule {}
