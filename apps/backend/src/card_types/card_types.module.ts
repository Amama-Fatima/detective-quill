import { Module } from '@nestjs/common';
import { CardTypesController } from './card_types.controller';
import { CardTypesService } from './card_types.service';
import { SupabaseModule } from "../supabase/supabase.module";


@Module({
  imports: [SupabaseModule],
  controllers: [CardTypesController],
  providers: [CardTypesService]
})
export class CardTypesModule {}
