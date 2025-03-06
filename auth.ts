/* eslint-disable @typescript-eslint/no-explicit-any */
import { compareSync } from 'bcrypt-ts-edge';        //compareSync to compare the db password with the form password  
import type { NextAuthConfig } from 'next-auth';     //TS type for the Next Auth configuration
import NextAuth from 'next-auth';                    
import CredentialsProvider from 'next-auth/providers/credentials';   //provider to authenticate users. This just email/password. There are many other providers , such as Google, Facebook, Twitter, etc.
import { prisma } from '@/db/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const config = {
  pages: { signIn: '/sign-in', error: '/sign-in' },          //setting sign-in page to `/sign-in` and error page to `/sign-in`. 
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },   //setting strategy to `jwt` and max age to 30 days. (the amount of time session will be valid, After it, user will have to log in again)
  adapter: PrismaAdapter(prisma),                            //using Prisma_adapter to integrate Next_Auth with Prisma
  //The providers are the different ways to authenticate user. We are using the `CredentialsProvider` which is a simple email/password. 
  providers: [
    CredentialsProvider({
      credentials: { email: { type: 'email' }, password: { type: 'password' } },
      //The `authorize` function is called when the user tries to authenticate. 
      async authorize(credentials) {
        // If credentials are not provided, return null .. otherwise, Find user in database by his email
        if (credentials == null) return null;        
        const user = await prisma.user.findFirst({ where: { email: credentials.email as string }});  
        // Check if user & his password exists, then check if the password in db matches the form submitted password
        if (user && user.password) {
          const isMatch = compareSync( credentials.password as string, user.password );
          // If password is correct, return the user object for the session
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        // If user doesn't exist or password is incorrect, return null
        return null;
      },
    }),
  ],
  //`session` callback is called whenever a session is accessed or created.
  callbacks: {    
    async session ({ session, token }: any) {      
      // Map the token data to the session object
      session.user.id = token.id;
      session.user.name = token.name; 
      session.user.role = token.role;       
      return session;
    },
    //`jwt` callback used to customize jwt & called whenever a JWT token is created (when a user signs in or signs up)
    async jwt({ token, user, trigger, session }: any) {
      // Assign extra data to the token (token only have the submitted data at sign up {name: '', email: ''})
      if (user) {
        token.id = user.id;                     // Add user id to the token data
        token.role = user.role;                 // Add user role to the token data
        // If user has no name, use email as their default name, then Update the user in the db with the new name
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];          
          await prisma.user.update({ where: { id: user.id }, data: { name: token.name } });
        }
      }
     /*if you add items to your cart as a guest and then log in, your cart will not persist. 
     we will ensure that the guest cart (we set it in a cookie by default) is set as current user cart when he signs in*/
      if (trigger === 'signIn' || trigger === 'signUp') {
        const cookiesObject = await cookies();                               //get NextJs cookies object
        const sessionCartId = cookiesObject.get('sessionCartId')?.value;     //get the cartId cookie
  
        if (sessionCartId) {
          // Find the guest cart by the Id we got from the cookie
          const sessionCart = await prisma.cart.findFirst({ where: { sessionCartId }, });  
          if (sessionCart) {
            // Overwrite any existing user cart
            await prisma.cart.deleteMany({ where: { userId: user.id }, });  
            // Assign the guest cart to the logged-in user
            await prisma.cart.update({ where: { id: sessionCart.id }, data: { userId: user.id },});
          }
        }      
      }       
      // if the session user updated his name, Update the token data with the new name 
      if (session?.user.name && trigger === 'update') { token.name = session.user.name; }
      return token;
    },
    //authorized callback is called when a user is trying to access a protected route, 
    //we will use it to get the cart cookie, so we show the stored guest cart even if the user is not logged in, 
    //This ID of 'sessionCartId' cookie will be used to identify the cart for this specific session
    authorized({ request }: { request: NextRequest }) {
     
      // 1st part is routs protection, created Array of regex patterns of protected paths
      const protectedPaths = [ /\/shipping-address/, /\/payment-method/, /\/place-order/, /\/profile/, /\/user\/(.*)/, /\/order\/(.*)/, /\/admin/, ];
      // Get pathname from the req URL object
      const { pathname } = request.nextUrl;
      // Check if user is not authenticated and on a protected path
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

      //2nd part is guest cart, Check for sessionCartId cookie .. if exists, return true, if not found -> create a new one
      if (!request.cookies.get('sessionCartId')) {           
        //Create a new response and add new headers of current (request.headers) to it
        const response = NextResponse.next({ request: { headers: new Headers(request.headers) } });         
        response.cookies.set('sessionCartId', crypto.randomUUID());     // Generate a sessionCartId cookie & Set it in the res cookies
        return response;                  // Return the response with the sessionCartId set
      } else {
        return true;
      }
    },
  },
} satisfies NextAuthConfig;


export const { handlers, auth, signIn, signOut } = NextAuth(config);
/*- `handlers` is an object that contains the HTTP handlers for the different endpoints that NextAuth uses. We will use these handlers to create the NextAuth API routes. (api/auth/[...nextauth]/route.ts)
- `auth` is a function that returns the current session. When we need to check if a user is authenticated and get the session, we will use this function.
- `signIn` is a function that we use to signs in a user.
- `signOut` is a function that we use to signs out a user. */