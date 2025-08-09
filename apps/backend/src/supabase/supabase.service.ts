import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const supabaseServiceKey = this.configService.get<string>(
      "SUPABASE_SERVICE_KEY"
    );

    if (!supabaseUrl) {
      throw new Error("Missing environment variable: SUPABASE_URL");
    }
    if (!supabaseServiceKey) {
      throw new Error("Missing environment variable: SUPABASE_SERVICE_KEY");
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  // Method to create client with user's JWT token
  getClientWithAuth(accessToken: string): SupabaseClient {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const supabaseAnonKey = this.configService.get<string>("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration");
    }

    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }
}
