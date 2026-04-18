import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = [
  "/dashboard",
  "/tasks",
  "/notes",
  "/planner",
  "/internships",
  "/groups",
];

function hasLikelySessionCookie(req: NextRequest) {
  return req.cookies.getAll().some((c) => {
    const n = c.name.toLowerCase();
    return (
      n.includes("session_token") ||
      n.includes("better-auth") ||
      n.startsWith("student-platform")
    );
  });
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !hasLikelySessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/signup") && hasLikelySessionCookie(req)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/tasks/:path*", "/notes/:path*", "/planner/:path*", "/internships/:path*", "/groups/:path*", "/login", "/signup"],
};
