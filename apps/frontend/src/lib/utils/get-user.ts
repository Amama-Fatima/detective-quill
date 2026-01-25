import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { SupabaseJwtPayload } from "../types/user";

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

export async function getUserFromCookie(): Promise<SupabaseJwtPayload | null> {
  const cookieStore = await cookies();

  console.log(
    "Auth cookie chunks:",
    cookieStore
      .getAll()
      .filter((c) => c.name.startsWith(COOKIE_PREFIX))
      .map((c) => ({ name: c.name, size: c.value.length })),
  );

  // 1️⃣ Get all chunks: .0, .1, .2, ...
  const tokenChunks = cookieStore
    .getAll()
    .filter((c) => c.name.startsWith(COOKIE_PREFIX))
    .sort((a, b) => {
      const aIndex = Number(a.name.split(".").pop());
      const bIndex = Number(b.name.split(".").pop());
      return aIndex - bIndex;
    })
    .map((c) => c.value);

  if (tokenChunks.length === 0) return null;

  // 2️⃣ Reconstruct full cookie value
  let cookieValue = tokenChunks.join("");

  try {
    // 3️⃣ Remove 'base64-' prefix and decode
    if (cookieValue.startsWith("base64-")) {
      cookieValue = cookieValue.substring(7);
    }

    // 4️⃣ Decode base64 to get the session JSON
    const sessionJson = Buffer.from(cookieValue, "base64").toString("utf-8");
    const session: SupabaseSession = JSON.parse(sessionJson);

    // 5️⃣ Extract and decode the access_token JWT
    const decoded = jwtDecode<SupabaseJwtPayload>(session.access_token);

    // 6️⃣ Optional: expiry guard
    if (decoded.exp * 1000 < Date.now()) {
      console.log("Token expired");
      return null;
    }

    console.log("Decoded JWT:", decoded);
    return decoded;
  } catch (err) {
    console.error("Error decoding session:", err);
    return null;
  }
}
