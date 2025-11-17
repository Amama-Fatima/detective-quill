import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SupabaseService } from "./supabase.service";
import { AdminSupabaseService } from "./admin-supabase.service";

@Module({
  imports: [ConfigModule],
  providers: [SupabaseService, AdminSupabaseService],
  exports: [SupabaseService, AdminSupabaseService],
})
export class SupabaseModule {}
