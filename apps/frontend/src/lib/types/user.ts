export interface SupabaseJwtPayload {
  // Standard JWT claims
  iss: string; // issuer
  sub: string; // user id
  aud: string; // audience
  exp: number; // expiry (unix timestamp)
  iat: number; // issued at (unix timestamp)

  // Supabase specific claims
  email?: string;
  phone?: string;
  role?: string;
  aal?: string; // Authentication Assurance Level
  session_id?: string;
  is_anonymous?: boolean;

  // Authentication method reference
  amr?: Array<{
    method: string;
    timestamp: number;
  }>;

  // App metadata
  app_metadata?: {
    provider?: string;
    providers?: string[];
    [key: string]: any; // Allow additional fields
  };

  // User metadata
  user_metadata?: {
    avatar_url?: string;
    email: string;
    email_verified?: boolean;
    full_name: string;
    phone_verified?: boolean;
    sub?: string;
    username?: string;
    [key: string]: any; // Allow additional custom fields
  };
}
