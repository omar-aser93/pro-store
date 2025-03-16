import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";


// middleware.ts file to protect routes
export default async function middleware(req: NextRequest) {

  // Get the token of nextAuth current user
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });   

  // Define protected paths (Regex patterns)
  const protectedPaths = [ /^\/shipping-address/, /^\/payment-method/, /^\/place-order/, /^\/profile/, /^\/user\/.*/, /^\/order\/.*/, /^\/admin/ ];

  // If user is not authenticated and tries to access protected paths, redirect to login & save current path as callbackUrl param
  if (!token && protectedPaths.some((pattern) => pattern.test(req.nextUrl.pathname))) {    
    const signInUrl = new URL("/sign-in", req.url);                   //Create a sign-in URL
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);  //Add (current path as callbackUrl) to the sign-in URL
    return NextResponse.redirect(signInUrl);                          //Redirect to the updated sign-in URL
  }

  // If user is not an admin and tries to access an admin route, redirect to home
  if (req.nextUrl.pathname.startsWith("/admin") && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }


  // Define public paths that authenticated users should not access (e.g., sign-in, sign-up)
  const publicPaths = [/^\/sign-in/, /^\/sign-up/];
  // If user is authenticated and tries to access public paths (e.g., sign-in, sign-up), redirect to home or callbackUrl
  if (token && publicPaths.some((pattern) => pattern.test(req.nextUrl.pathname))) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") || "/";
    return NextResponse.redirect(new URL(callbackUrl, req.url));
  }

  return NextResponse.next();           // middleware proceeds when no redirect is triggered
}


// Matcher to Apply middleware only to specific routes
export const config = {
  matcher: ["/shipping-address", "/payment-method", "/place-order", "/profile", "/user/:path*", "/order/:path*", "/admin/:path*", "/sign-in", "/sign-up" ],
};


