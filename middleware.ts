// Middleware file we can use it to ptotect the routes, also add custom logic to the NextAuth.js authentication.

import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Protected routes
  const protectedPaths = [/\/shipping-address/, /\/payment-method/, /\/place-order/, /\/profile/, /\/user\/(.*)/, /\/order\/(.*)/, /\/admin/ ];
  
  const isAuthenticated = !!req.auth;                       // Check if the user is authenticated
  // Redirect unauthenticated users to sign-in page 
  if (!isAuthenticated && protectedPaths.some((p) => p.test(pathname))) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

//   //when a user visits the app, Check for sessionCartId cookie .. if exists, return true, if not found -> create a new one
//    const sessionCartId = req.cookies.get('sessionCartId')?.value;
//    if (!sessionCartId) {
//      // Create a new response and set the sessionCartId cookie
//      const response = NextResponse.next();
//      response.cookies.set('sessionCartId', crypto.randomUUID());
//      return response;
//    }

  return NextResponse.next();
});


// Match all routes except static files and API routes
export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']}; 