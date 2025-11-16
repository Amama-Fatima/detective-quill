import { Module } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { ProjectsController } from "./projects.controller";
import { SupabaseModule } from "../supabase/supabase.module";
import { MembersModule } from "src/members/members.module";
@Module({
  imports: [SupabaseModule, MembersModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
