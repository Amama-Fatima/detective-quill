import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SupabaseModule } from "./supabase/supabase.module";
import { ConfigModule } from "@nestjs/config";
import { ProjectsService } from "./projects/projects.service";
import { ProjectsModule } from "./projects/projects.module";
import { FsNodesModule } from "./fs-nodes/fs-nodes.module";

@Module({
  controllers: [AppController],
  providers: [AppService, ProjectsService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    SupabaseModule,
    ProjectsModule,
    FsNodesModule,
  ],
})
export class AppModule {}
