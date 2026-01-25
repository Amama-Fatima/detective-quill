import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { SupabaseJwtPayload } from "../types/user";
import { cache } from "react";

interface SupabaseSession {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;
  user?: any;
}

// Extract project ref from Supabase URL
const PROJECT_REF = process.env
  .NEXT_PUBLIC_SUPABASE_URL!.replace("https://", "")
  .split(".")[0];

const COOKIE_PREFIX = `sb-${PROJECT_REF}-auth-token`;

export const getUserFromCookie = cache(
  async (): Promise<SupabaseJwtPayload | null> => {
    console.time("getUserFromCookie-cached");
    const cookieStore = await cookies();

    console.log(
      "Auth cookie chunks:",
      cookieStore
        .getAll()
        .filter((c) => c.name.startsWith(COOKIE_PREFIX))
        .map((c) => ({ name: c.name, size: c.value.length })),
    );

    const tokenChunks = cookieStore
      .getAll()
      .filter((c) => c.name.startsWith(COOKIE_PREFIX))
      .sort((a, b) => {
        const aIndex = Number(a.name.split(".").pop());
        const bIndex = Number(b.name.split(".").pop());
        return aIndex - bIndex;
      })
      .map((c) => c.value);

    if (tokenChunks.length === 0) {
      console.timeEnd("getUserFromCookie-cached");
      return null;
    }

    let cookieValue = tokenChunks.join("");

    try {
      if (cookieValue.startsWith("base64-")) {
        cookieValue = cookieValue.substring(7);
      }

      const sessionJson = Buffer.from(cookieValue, "base64").toString("utf-8");
      const session: SupabaseSession = JSON.parse(sessionJson);

      const decoded = jwtDecode<SupabaseJwtPayload>(session.access_token);

      if (decoded.exp * 1000 < Date.now()) {
        console.log("Token expired");
        console.timeEnd("getUserFromCookie-cached");
        return null;
      }

      console.log("Decoded JWT:", decoded);
      console.timeEnd("getUserFromCookie-cached");
      return decoded;
    } catch (err) {
      console.error("Error decoding session:", err);
      console.timeEnd("getUserFromCookie-cached");
      return null;
    }
  },
);
