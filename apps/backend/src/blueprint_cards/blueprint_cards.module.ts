import { Module } from '@nestjs/common';
import { BlueprintCardsController } from './blueprint_cards.controller';
import { BlueprintCardsService } from './blueprint_cards.service';
import { SupabaseModule } from "../supabase/supabase.module";
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  imports: [SupabaseModule, ProjectsModule],
  controllers: [BlueprintCardsController],
  providers: [BlueprintCardsService]
})
export class BlueprintCardsModule {}
