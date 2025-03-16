import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req }); // Get user session

  // If user is not authenticated, redirect to sign-in
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // If user is not an admin, redirect to home page
  if (req.nextUrl.pathname.startsWith("/admin") && token.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Apply middleware only to protected routes
export const config = {
  matcher: ["/admin/:path*"], // Protects all /admin pages
};
