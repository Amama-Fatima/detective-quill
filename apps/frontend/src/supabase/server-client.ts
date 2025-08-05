import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { getCookie, setCookie } from "cookies-next";
import { cookies } from "next/headers";
import { type NextRequest, type NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createSupabaseReqResClient(
  req: NextRequest,
  res: NextResponse
) {
  return createServerClient(
    SUPABASE_URL as string,
    SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          return getCookie(name, { req, res });
        },
        set(name: string, value: string, options: CookieOptions) {
          setCookie(name, value, { req, res, ...options });
        },
        remove(name: string, options: CookieOptions) {
          setCookie(name, "", { req, res, ...options });
        },
      },
    }
  );
}

export const createClient = async (
  cookieStorePromise: ReturnType<typeof cookies>
) => {
  const cookieStore = await cookieStorePromise;
  return createServerClient(
    SUPABASE_URL as string,
    SUPABASE_ANON_KEY as string,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
};
export const createSupabaseServerClient = async () => {
  const cookieStorePromise = cookies();
  const supabase = await createClient(cookieStorePromise);
  return supabase;
};
