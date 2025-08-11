import { Module } from "@nestjs/common";
import { ChaptersController } from "./chapters.controller";
import { ChaptersService } from "./chapters.service";
import { SupabaseModule } from "../supabase/supabase.module";
import { FoldersModule } from "../folders/folders.module";

@Module({
  imports: [SupabaseModule, FoldersModule],
  controllers: [ChaptersController],
  providers: [ChaptersService],
  exports: [ChaptersService],
})
export class ChaptersModule {}
