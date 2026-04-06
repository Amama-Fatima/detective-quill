import { Module } from "@nestjs/common";
import { InvitationsService } from "./invitations.service";
import { InvitationsController } from "./invitations.controller";
import { MembersModule } from "../members/members.module";
import { ProjectsModule } from "../projects/projects.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { WorkerInvitationsService } from "./worker-invitations.service";
import { BadgesNStatsModule } from "src/badges_n_stats/badges_n_stats.module";
@Module({
  imports: [MembersModule, ProjectsModule, SupabaseModule, BadgesNStatsModule],
  providers: [InvitationsService, WorkerInvitationsService],
  controllers: [InvitationsController],
  exports: [InvitationsService, WorkerInvitationsService],
})
export class InvitationsModule {}
