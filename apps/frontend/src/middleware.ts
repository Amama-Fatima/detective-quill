import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function extractProjectId(pathname: string): string | null {
  const workspaceMatch = pathname.match(/^\/workspace\/([a-f0-9-]{36})/);
  return workspaceMatch ? workspaceMatch[1] : null;
}

async function isProjectMember(
  supabase: any,
  userId: string,
  projectId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("projects_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single();

    return !!data && !error;
  } catch (error) {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return req.cookies.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        }));
      },
      setAll(
        cookies: { name: string; value: string; options?: CookieOptions }[]
      ) {
        cookies.forEach(({ name, value, options }) => {
          res.cookies.set({ name, value, ...options });
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (req.nextUrl.pathname.startsWith("/workspace/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  const projectId = extractProjectId(req.nextUrl.pathname);

  if (projectId) {
    const isMember = await isProjectMember(supabase, user.id, projectId);

    if (!isMember) {
      if (req.nextUrl.pathname.startsWith("/workspace/api")) {
        return NextResponse.json(
          {
            error: "Forbidden",
            message: "You don't have access to this project",
          },
          { status: 403 }
        );
      }
      return NextResponse.redirect(
        new URL("/dashboard?error=no-access", req.url)
      );
    }
  }

  return res;
}

export const config = {
  matcher: ["/workspace/:path*"],
};
