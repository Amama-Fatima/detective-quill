import { Module } from "@nestjs/common";
import { FoldersController } from "./folders.controller";
import { FoldersService } from "./folders.service";
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [SupabaseModule],
  controllers: [FoldersController],
  providers: [FoldersService],
  exports: [FoldersService], // Export for use in other modules
})
export class FoldersModule {}
