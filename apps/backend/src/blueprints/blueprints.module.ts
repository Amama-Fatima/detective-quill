import { Module } from '@nestjs/common';
import { SupabaseModule } from "../supabase/supabase.module";
import { BlueprintsController } from './blueprints.controller';
import { BlueprintsService } from './blueprints.service';


@Module({
  imports: [SupabaseModule],
  controllers: [BlueprintsController],
  providers: [BlueprintsService],
  exports: [BlueprintsService],
})
export class BlueprintsModule {}
