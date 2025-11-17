import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { MembersModule } from "../members/members.module";
import { ProjectsModule } from "../projects/projects.module";
import { SupabaseModule } from "../supabase/supabase.module";
import { WorkerInvitationsService } from './worker-invitations.service';

@Module({
  imports: [MembersModule, ProjectsModule, SupabaseModule],
  providers: [InvitationsService, WorkerInvitationsService],
  controllers: [InvitationsController],
  exports: [InvitationsService, WorkerInvitationsService],
})
export class InvitationsModule {}
