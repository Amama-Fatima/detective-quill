import { Module } from "@nestjs/common";
import { ChaptersController } from "./chapters.controller";
import { ChaptersService } from "./chapters.service";
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [SupabaseModule],
  controllers: [ChaptersController],
  providers: [ChaptersService],
  exports: [ChaptersService],
})
export class ChaptersModule {}
