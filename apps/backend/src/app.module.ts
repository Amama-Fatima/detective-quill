import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ChaptersModule } from "./chapters/chapters.module";
import { SupabaseModule } from "./supabase/supabase.module";
import { ConfigModule } from "@nestjs/config";
import { FoldersModule } from "./folders/folders.module";
import { BlueprintsModule } from './blueprints/blueprints.module';
import { CardTypesModule } from './card_types/card_types.module';
import { BlueprintCardsModule } from './blueprint_cards/blueprint_cards.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    SupabaseModule,
    ChaptersModule,
    FoldersModule,
    BlueprintsModule,
    CardTypesModule,
    BlueprintCardsModule,
  ],
})
export class AppModule {}
