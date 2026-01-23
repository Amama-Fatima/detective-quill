import { Module } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { SupabaseModule } from "../supabase/supabase.module";
import { MembersService } from "src/members/members.service";

@Module({
  imports: [SupabaseModule],
  controllers: [CommentsController],
  providers: [CommentsService, MembersService],
  exports: [CommentsService],
})
export class CommentsModule {}
