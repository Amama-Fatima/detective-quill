import { Module } from "@nestjs/common";
import { SupabaseModule } from "src/supabase/supabase.module";
import { SnapshotsModule } from "src/snapshots/snapshots.module";
import { StoryEmbeddingsService } from "./story-embeddings.service";

@Module({
  imports: [SupabaseModule, SnapshotsModule],
  providers: [StoryEmbeddingsService],
  exports: [StoryEmbeddingsService],
})
export class StoryEmbeddingsModule {}
