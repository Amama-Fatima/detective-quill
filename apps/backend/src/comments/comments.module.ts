import { Module } from "@nestjs/common";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { SupabaseModule } from "../supabase/supabase.module";
import { MembersModule } from "../members/members.module";

@Module({
  imports: [SupabaseModule, MembersModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
