import { Injectable, Scope, Inject } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ConfigService } from "@nestjs/config";

@Injectable({ scope: Scope.REQUEST })
export class SupabaseService {
  private clientInstance: SupabaseClient;

  constructor(
    private configService: ConfigService,
    @Inject(REQUEST) private request: Request
  ) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const supabaseServiceKey = this.configService.get<string>("SUPABASE_SERVICE_KEY");
    const supabaseAnonKey = this.configService.get<string>("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    // default admin client (fallback)
    this.clientInstance = createClient(supabaseUrl, supabaseServiceKey);

    // if request includes a Bearer token, create a single per-request user client
    const auth = this.request.headers["authorization"];
    const token = typeof auth === "string" && auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (token && supabaseAnonKey) {
      this.clientInstance = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });
    }
  }

  get client(): SupabaseClient {
    return this.clientInstance;
  }

  // optional: still available if you need to create a client for another token
  getClientWithAuth(accessToken: string): SupabaseClient {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const supabaseAnonKey = this.configService.get<string>("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) throw new Error("Missing Supabase configuration");
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });
  }
}