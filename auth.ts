/* eslint-disable @typescript-eslint/no-explicit-any */
import { compareSync } from 'bcrypt-ts-edge';         //function to compare the encrypted db password with the form password      
import type { NextAuthConfig, DefaultSession } from 'next-auth';      //TS type for the Next Auth configuration
import NextAuth from 'next-auth';                    
import CredentialsProvider from 'next-auth/providers/credentials';   //email/password provider to authenticate users. 
import GoogleProvider from 'next-auth/providers/google';             //Google provider to authenticate users.
import { prisma } from '@/db/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { cookies } from 'next/headers';

//TS fix for (role) in session, by default the NextAuth session user type only has a name, email and id. we extend it with extra properties (e.g. role)
declare module 'next-auth' {
  export interface Session { user: { role: string; } & DefaultSession['user'];  }
}


export const config = {
  pages: { signIn: '/sign-in', error: '/sign-in' },          //setting sign-in page to `/sign-in` and error page to `/sign-in`. 
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },   //setting strategy to `jwt` and max age to 30 days. (the amount of time session will be valid, After it, user will have to log in again)
  adapter: PrismaAdapter(prisma),                            //using Prisma_adapter to integrate Next_Auth with Prisma
  //The providers are the different ways to authenticate user. We are using the `CredentialsProvider` which is a simple email/password. 
  providers: [
    //Credentials provider to authenticate users (sign in with email and password)
    CredentialsProvider({
      credentials: { email: { type: 'email' }, password: { type: 'password' } },
      //The `authorize` function is called when the user tries to authenticate. 
      async authorize(credentials) {
        // If credentials are not provided, return null .. otherwise, Find user in database by his email
        if (credentials == null) return null;        
        const user = await prisma.user.findFirst({ where: { email: credentials.email as string }});  
        // Check if the user & his password exists, then check if the password in db matches the form submitted password
        if (user && user.password) {
          const isMatch = compareSync( credentials.password as string, user.password );         
          // If password is correct, return the user object for the session
          if (isMatch) { return { id: user.id, name: user.name, email: user.email, role: user.role }; }
        }
        // If user doesn't exist or password is incorrect, return null
        return null;
      },
    }),
    //Google provider to authenticate users (1st we need to create a new project in `Google Developer Console` to get the client id and secret)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true    // Allow linking of Google account with existing email accounts (dangerous, use with caution)       
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
        // if the session user updated his name, Update the token data with the new name (without re-logging)
        if (session?.user.name && trigger === 'update') { token.name = session.user.name; }

        // ** Manually Handling persisting a guest cart to the user when he signs in**                             
        const sessionCartId = (await cookies()).get("sessionCartId")?.value;     // Get sessionCartId cookie for the guest cart (Next.js cookies)
        if (sessionCartId) {      
          const sessionCart = await prisma.cart.findFirst({ where: { sessionCartId } });  //Find guest cart by the sessionCartId in the DB
          if (sessionCart) {
            await prisma.cart.deleteMany({ where: { userId: user.id } });      // Clear any existing user old cart
            await prisma.cart.update({ where: { id: sessionCart.id }, data: { userId: user.id } });  // Assign guest cart to the user
          }
        }
      } 
      return token;
    },  
  },
} satisfies NextAuthConfig;


export const { handlers, auth, signIn, signOut } = NextAuth(config);
/*- `handlers` is an object that contains the HTTP handlers for the different endpoints that NextAuth uses. We will use these handlers to create the NextAuth API routes. (api/auth/[...nextauth]/route.ts)
- `auth` is a function that returns the current session. When we need to check if a user is authenticated and get the session, we will use this function.
- `signIn` is a function that we use to signs in a user.
- `signOut` is a function that we use to signs out a user. */