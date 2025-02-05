'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';   //`isRedirectError` function used to check if error is a redirect error
import { signIn, signOut } from '@/auth';                 //import the signIn and signOut functions from auth.ts
import { signInType, signUpType} from '../validator';     //import the zod Schemas types from validator.ts
import { hashSync } from 'bcrypt-ts-edge';                //hashing library
import { prisma } from '@/db/prisma';                     //import the Prisma client from prisma.ts, the file we created


// Sign in the user with email/password server-action
export async function signInWithCredentials(prevState: unknown, data: signInType) {
  try {    
    await signIn("credentials", data);                             //pass user credentials to Next_Auth signIn() function 
    return { success: true, message: "Signed in successfully" };   //return success message, will be used in useActionState()
  } catch (error) {
    if (isRedirectError(error)) { throw error; }
    return { success: false, message: "Invalid email or password" };   //return error message, will be used in useActionState()
  }
}



// Sign the user out server-action
export async function signOutUser() {
    await signOut();                       //Next_Auth signOut() function
}



// Register a new user server-action
export async function signUp(prevState: unknown, data: signUpType) {
  try { 

    //check if the user already exists in the db, then return error message that will be used in useActionState()
    const isExists = await prisma.user.findUnique({ where: { email: data.email } });    
    if (isExists) { return { success: false, message: 'User already exists' }; }

    const plainPassword = data.password;              //store the password before hashing (Next_Auth login doesn't take hashed passwords)
    data.password = hashSync(data.password, 10);      //hash the password

    //create the user in the db using Prisma (with the data we recieved & hashed password)
    await prisma.user.create({ data: { name: data.name, email: data.email, password: data.password } });

    await signIn('credentials', { email: data.email, password: plainPassword });    //pass user credentials to Next_Auth signIn() function 
    return { success: true, message: 'User created successfully' };                 //return success message, will be used in useActionState()
  } catch (error) {
    if (isRedirectError(error)) { throw error; }  
    return { success: false, message: 'Registration failed, Try again later' };     //return error message, will be used in useActionState()
  }
}