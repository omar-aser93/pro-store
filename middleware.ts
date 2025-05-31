import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from 'next-intl/middleware';
import {locales, defaultLocale, localePrefix} from '@/i18n';

// Initialize (next-intl) middleware with i18n config values we imported from i18n.ts 
const intlMiddleware = createMiddleware({ locales, defaultLocale, localePrefix });       


// middleware.ts file to protect routes
export default async function middleware(req: NextRequest) {
  
  const intlResponse = intlMiddleware(req);         // Run next-intl middleware first to handle locale detection and redirection

  // Define protected paths with (Regex patterns)
  const protectedPaths = [/^\/([a-z]{2}\/)?shipping-address/, /^\/([a-z]{2}\/)?payment-method/, /^\/([a-z]{2}\/)?place-order/, /^\/([a-z]{2}\/)?profile/, /^\/([a-z]{2}\/)?user\/.*/, /^\/([a-z]{2}\/)?order\/.*/, /^\/([a-z]{2}\/)?admin/];
 
  // Define public paths that authenticated users should not access (e.g., sign-in, sign-up)
  const publicPaths = [/^\/([a-z]{2}\/)?sign-in/, /^\/([a-z]{2}\/)?sign-up/, /^\/([a-z]{2}\/)?forgot-password/, /^\/([a-z]{2}\/)?reset-password/, /^\/([a-z]{2}\/)?verify-otp/];

  // Get the token of nextAuth current user
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: process.env.NODE_ENV === "production" });   

  // If user is not authenticated and tries to access protected paths, redirect to login & save current path as callbackUrl param
  if (!token && protectedPaths.some((pattern) => pattern.test(req.nextUrl.pathname))) {    
    const signInUrl = new URL(`/sign-in`, req.url);                   //Create a sign-in URL
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);  //Add (current path as callbackUrl) to the sign-in URL
    return NextResponse.redirect(signInUrl);                          //Redirect to the updated sign-in URL
  }

  // If user is not an admin and tries to access an admin route, redirect to home (e.g., /en/) 
  if (req.nextUrl.pathname.startsWith(`/admin`) && token?.role !== "admin") {
    return NextResponse.redirect(new URL(`/`, req.url));
  }
 
  // If user is authenticated and tries to access public paths (e.g., sign-in, sign-up), redirect to home or callbackUrl
  if (token && publicPaths.some((pattern) => pattern.test(req.nextUrl.pathname)) ) {
    // If there is a callbackUrl, redirect to that URL, otherwise redirect to home
    return req.nextUrl.searchParams.has("callbackUrl") 
        ? NextResponse.redirect(new URL(req.nextUrl.searchParams.get("callbackUrl")!, req.url)) 
        : NextResponse.redirect(new URL(`/`, req.url));
  }

  return intlResponse;            // middleware proceeds when no redirect is triggered
}


// Matcher to Apply middleware only to specific routes (all paths except for static files, _next, and API routes)
export const config = {  
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};


