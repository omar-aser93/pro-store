// import { NextResponse, NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";
// import createMiddleware from 'next-intl/middleware';
// import {locales, defaultLocale, localePrefix} from '@/i18n';

// // Initialize (next-intl) middleware with i18n config values we imported from i18n.ts 
// const intlMiddleware = createMiddleware({ locales, defaultLocale, localePrefix });       


// // middleware.ts file to protect routes
// export default async function proxy(req: NextRequest) {
  
//   const intlResponse = intlMiddleware(req);         // Run next-intl middleware first to handle locale detection and redirection

//   // Define protected paths with (Regex patterns)
//   const protectedPaths = [/^\/([a-z]{2}\/)?shipping-address/, /^\/([a-z]{2}\/)?payment-method/, /^\/([a-z]{2}\/)?place-order/, /^\/([a-z]{2}\/)?profile/, /^\/([a-z]{2}\/)?user\/.*/, /^\/([a-z]{2}\/)?order\/.*/, /^\/([a-z]{2}\/)?admin/];
 
//   // Define public paths that authenticated users should not access (e.g., sign-in, sign-up)
//   const publicPaths = [/^\/([a-z]{2}\/)?sign-in/, /^\/([a-z]{2}\/)?sign-up/, /^\/([a-z]{2}\/)?forgot-password/, /^\/([a-z]{2}\/)?reset-password/, /^\/([a-z]{2}\/)?verify-otp/];

//   // Get the token of nextAuth current user
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET, secureCookie: process.env.NODE_ENV === "production" });   

//   // If user is not authenticated and tries to access protected paths, redirect to login & save current path as callbackUrl param
//   if (!token && protectedPaths.some((pattern) => pattern.test(req.nextUrl.pathname))) {    
//     const signInUrl = new URL(`/sign-in`, req.url);                   //Create a sign-in URL
//     signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);  //Add (current path as callbackUrl) to the sign-in URL
//     return NextResponse.redirect(signInUrl);                          //Redirect to the updated sign-in URL
//   }

//   // If user is not an admin and tries to access an admin route, redirect to home (e.g., /en/) 
//   if (req.nextUrl.pathname.startsWith(`/admin`) && token?.role !== "admin") {
//     return NextResponse.redirect(new URL(`/`, req.url));
//   }
 
//   // If user is authenticated and tries to access public paths (e.g., sign-in, sign-up), redirect to home or callbackUrl
//   if (token && publicPaths.some((pattern) => pattern.test(req.nextUrl.pathname)) ) {
//     // If there is a callbackUrl, redirect to that URL, otherwise redirect to home
//     return req.nextUrl.searchParams.has("callbackUrl") 
//         ? NextResponse.redirect(new URL(req.nextUrl.searchParams.get("callbackUrl")!, req.url)) 
//         : NextResponse.redirect(new URL(`/`, req.url));
//   }

//   return intlResponse;            // middleware proceeds when no redirect is triggered
// }


// // Matcher to Apply middleware only to specific routes (all paths except for static files, _next, and API routes)
// export const config = {  
//   matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
// };


import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale, localePrefix } from "@/i18n";

// Initialize next-intl middleware with i18n config values we imported from i18n.ts
const intlMiddleware = createMiddleware({ locales, defaultLocale, localePrefix });

// Middleware/proxy to protect routes based on authentication and roles
export default async function proxy(req: NextRequest) {

  const pathname = req.nextUrl.pathname;     // Get the current pathname from the request URL 
  const intlResponse = intlMiddleware(req);  // Run next-intl FIRST to handle locale detection and redirection
  
  // Check if next-intl wants to handle locale detection/redirection
  if (intlResponse?.headers.get('x-next-intl-redirect')) { return intlResponse; }

  // Detect current locale from pathname (e.g., /en/shipping-address → en)
  const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/);
  const currentLocale = localeMatch?.[1] || defaultLocale;

  // Define protected paths with (Regex patterns)
  const protectedPaths = [
    /^\/([a-z]{2}\/)?shipping-address/,
    /^\/([a-z]{2}\/)?payment-method/,
    /^\/([a-z]{2}\/)?place-order/,
    /^\/([a-z]{2}\/)?profile/,
    /^\/([a-z]{2}\/)?user\/.*/,
    /^\/([a-z]{2}\/)?order\/.*/,
    /^\/([a-z]{2}\/)?admin.*/
  ];

  // Define public paths that authenticated users should not access (e.g., sign-in, sign-up)
  const publicPaths = [
    /^\/([a-z]{2}\/)?sign-in/,
    /^\/([a-z]{2}\/)?sign-up/,
    /^\/([a-z]{2}\/)?forgot-password/,
    /^\/([a-z]{2}\/)?reset-password/,
    /^\/([a-z]{2}\/)?verify-otp/
  ];

  // Get auth token of nextAuth current user
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET!, secureCookie: process.env.NODE_ENV === "production" });

  // If user is not authenticated and tries to access protected paths, redirect to login & save current path as callbackUrl param
  if (!token && protectedPaths.some(p => p.test(pathname))) {
    const signInUrl = new URL(`/${currentLocale}/sign-in`, req.url);   // Create a sign-in URL with current locale
    signInUrl.searchParams.set("callbackUrl", pathname);               // Add (current path as callbackUrl) to the sign-in URL
    return NextResponse.redirect(signInUrl);                           // Redirect to the updated sign-in URL
  }

  // If user is authenticated and tries to access public paths (e.g., sign-in, sign-up), redirect to home or callbackUrl
  if (token && publicPaths.some(p => p.test(pathname))) {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");  // Get callbackUrl from search params
    // Redirect to callbackUrl if it exists, otherwise redirect to home with current locale
    return NextResponse.redirect( new URL(callbackUrl || `/${currentLocale}`, req.url) );
  }

  //  If user is not an admin and tries to access an admin route, redirect to home (e.g., /en/)
  if (token && /^\/([a-z]{2}\/)?admin/.test(pathname) && token.role !== "admin") {
    return NextResponse.redirect(new URL(`/${currentLocale}`, req.url));
  }

  // Return the intlResponse/NextResponse object  (proxy proceed if no redirect is triggered)
  return intlResponse || NextResponse.next();
}

// Matcher to Apply middleware only to specific routes (all paths except for static files, _next, _vercel, ... and API routes)
export const config = { matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"] };