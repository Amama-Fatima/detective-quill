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
const AUTH_COOKIE_REGEX = new RegExp(
  `^${COOKIE_PREFIX.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}(?:\\.(\\d+))?$`,
);

function decodeMaybeBase64Session(cookieValue: string): SupabaseSession {
  const normalizedValue = cookieValue.startsWith("\"") && cookieValue.endsWith("\"")
    ? cookieValue.slice(1, -1)
    : cookieValue;

  const decodeBase64Utf8 = (value: string) => {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return Buffer.from(padded, "base64").toString("utf-8");
  };

  if (normalizedValue.startsWith("base64-")) {
    return JSON.parse(decodeBase64Utf8(normalizedValue.substring(7)));
  }

  try {
    return JSON.parse(normalizedValue);
  } catch {
    return JSON.parse(decodeBase64Utf8(normalizedValue));
  }
}

export const getUserFromCookie = cache(
  async (): Promise<SupabaseJwtPayload | null> => {
    console.time("getUserFromCookie-cached");
    const cookieStore = await cookies();

    const tokenChunks = cookieStore
      .getAll()
      .map((cookie) => {
        const match = cookie.name.match(AUTH_COOKIE_REGEX);
        if (!match) {
          return null;
        }

        return {
          index: match[1] ? Number(match[1]) : 0,
          value: decodeURIComponent(cookie.value),
        };
      })
      .filter((chunk): chunk is { index: number; value: string } => Boolean(chunk))
      .sort((a, b) => a.index - b.index)
      .map((chunk) => chunk.value);

    if (tokenChunks.length === 0) {
      console.timeEnd("getUserFromCookie-cached");
      return null;
    }

    let cookieValue = tokenChunks.join("");

    try {
      const session: SupabaseSession = decodeMaybeBase64Session(cookieValue);

      const decoded = jwtDecode<SupabaseJwtPayload>(session.access_token);

      if (decoded.exp * 1000 < Date.now()) {
        console.log("Token expired");
        console.timeEnd("getUserFromCookie-cached");
        return null;
      }

      console.timeEnd("getUserFromCookie-cached");
      return decoded;
    } catch (err) {
      console.error("Error decoding session:", err);
      console.timeEnd("getUserFromCookie-cached");
      return null;
    }
  },
);
