import { compareSync } from 'bcrypt-ts-edge';        //compareSync to compare the db password with the form password  
import type { NextAuthConfig } from 'next-auth';     //TS type for the Next Auth configuration
import NextAuth from 'next-auth';                    
import CredentialsProvider from 'next-auth/providers/credentials';   //provider to authenticate users. This just email/password. There are many other providers , such as Google, Facebook, Twitter, etc.
import { prisma } from '@/db/prisma';
import { PrismaAdapter } from '@auth/prisma-adapter';

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
  //`session` callback is called whenever a session is accessed or created / `jwt` callback used to customize jwt
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session ({ session, token }: any) {      
      // Map the token data to the session object
      session.user.id = token.id;
      session.user.name = token.name; 
      session.user.role = token.role;       
      return session;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, trigger, session }: any) {
      // Assign extra user fields to the token / update the token data
      if (user) {
        token.role = user.role;                 // Add user role to the token data
        // If user has no name, use email as their default name, then Update the user in the db with the new name
        if (user.name === 'NO_NAME') {
          token.name = user.email!.split('@')[0];          
          await prisma.user.update({ where: { id: user.id }, data: { name: token.name } });
        }
      }
      // Handle session updates (e.g., If user updated his name, update the name on the session)
      if (session?.user.name && trigger === 'update') { token.name = session.user.name; }
      return token;
    },
  },
} satisfies NextAuthConfig;


export const { handlers, auth, signIn, signOut } = NextAuth(config);
/*- `handlers` is an object that contains the HTTP handlers for the different endpoints that NextAuth uses. We will use these handlers to create the NextAuth API routes. (api/auth/[...nextauth]/route.ts)
- `auth` is a function that returns the current session. When we need to check if a user is authenticated and get the session, we will use this function.
- `signIn` is a function that we use to signs in a user.
- `signOut` is a function that we use to signs out a user. */