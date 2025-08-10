import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ChaptersModule } from "./chapters/chapters.module";
import { SupabaseModule } from "./supabase/supabase.module";
import { ConfigModule } from "@nestjs/config";

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
  ],
})
export class AppModule {}
