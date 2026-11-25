import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROLE_HOME: Record<string, string> = {
  owner: "/owner/dashboard",
  veterinarian: "/veterinarian/dashboard",
  admin: "/admin/dashboard",
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requiredRole = pathname.startsWith("/admin")
    ? "admin"
    : pathname.startsWith("/veterinarian")
      ? "veterinarian"
      : pathname.startsWith("/owner")
        ? "owner"
        : null;
  if (!requiredRole) return NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.redirect(new URL("/auth/login?setup=supabase", request.url));

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet: Array<{ name: string; value: string; options?: any }>) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (error || !profile) return NextResponse.redirect(new URL("/auth/login?profile=missing", request.url));
  if (profile.role !== requiredRole) {
    return NextResponse.redirect(new URL(ROLE_HOME[profile.role] || "/", request.url));
  }
  return response;
}

export const config = {
  matcher: ["/owner/:path*", "/veterinarian/:path*", "/admin/:path*"],
};
