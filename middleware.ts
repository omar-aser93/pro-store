
import { NextResponse , NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";


export default async function middleware(req: NextRequest) {

  const token = await getToken({ req });                  // Get the token of nextAuth session_user 

  // Define protected paths (Regex patterns)
  const protectedPaths = [/^\/shipping-address/, /^\/payment-method/, /^\/place-order/, /^\/profile/, /^\/user\/.*/, /^\/order\/.*/, /^\/admin/ ];

  // If user is not authenticated and tries to access protected paths, redirect to login
  if (!token && protectedPaths.some((pattern) => pattern.test(req.nextUrl.pathname))) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // If user is not an admin and tries to access an admin route, redirect to home
  if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Check for session cart cookie
  if (!req.cookies.get("sessionCartId")) {
    const sessionCartId = crypto.randomUUID();

    // Create response and set the new sessionCartId cookie
    const response = NextResponse.next();
    response.cookies.set("sessionCartId", sessionCartId, { httpOnly: true });

    return response;
  }

  return NextResponse.next();
}

// Apply middleware only to specific routes
export const config = {
  matcher: ["/shipping-address", "/payment-method", "/place-order", "/profile", "/user/:path*", "/order/:path*", "/admin/:path*"],
};
