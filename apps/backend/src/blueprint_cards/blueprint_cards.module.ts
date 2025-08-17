import { Module } from '@nestjs/common';
import { BlueprintCardsController } from './blueprint_cards.controller';
import { BlueprintCardsService } from './blueprint_cards.service';
import { SupabaseModule } from "../supabase/supabase.module";

@Module({
  imports: [SupabaseModule],
  controllers: [BlueprintCardsController],
  providers: [BlueprintCardsService]
})
export class BlueprintCardsModule {}
