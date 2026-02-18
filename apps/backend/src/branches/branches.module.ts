import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { BranchesController } from "./branches.controller";
import { BranchesService } from "./branches.service";
import { BranchesMiddleware } from "./branches.middleware";
import { SupabaseModule } from "../supabase/supabase.module";
import { ProjectsModule } from "../projects/projects.module";

@Module({
  imports: [SupabaseModule, ProjectsModule],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BranchesMiddleware).forRoutes(BranchesController);
  }
}
