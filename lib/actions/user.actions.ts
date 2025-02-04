'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';   //`isRedirectError` function used to check if error is a redirect error
import { signIn, signOut } from '@/auth';                 //import the signIn and signOut functions from auth.ts
import { signInFormSchema, signUpFormSchema} from '../validator';     //import the zod Schemas from validator.ts
import { hashSync } from 'bcrypt-ts-edge';               //hashing library
import { prisma } from '@/db/prisma';                    //import the Prisma client from prisma.ts, the file we created
import { formatError } from '../utils';                  //utility function to handle sign-up server-action errors


// Sign in the user with email/password server-action
export async function signInWithCredentials(prevState: unknown, formData: FormData) {
  try {
    // Validate the recieved form data using the Zod Schema
    const user = signInFormSchema.parse({ email: formData.get("email"), password: formData.get("password") });
    await signIn("credentials", user);                             //pass user credentials to Next_Auth signIn() function 
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
export async function signUp(prevState: unknown, formData: FormData) {
  try {
    // Validate the recieved form data using the Zod Schema
    const user = signUpFormSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      confirmPassword: formData.get('confirmPassword'),
      password: formData.get('password'),
    });

    const plainPassword = user.password;              //store the password before hashing (Next_Auth login doesn't take hashed passwords)
    user.password = hashSync(user.password, 10);      //hash the password

    //create the user in the db using Prisma (with the data we recieved & hashed password)
    await prisma.user.create({ data: { name: user.name, email: user.email, password: user.password } });

    await signIn('credentials', { email: user.email, password: plainPassword });    //pass user credentials to Next_Auth signIn() function 
    return { success: true, message: 'User created successfully' };                 //return success message, will be used in useActionState()
  } catch (error) {
    if (isRedirectError(error)) { throw error; }
    return { success: false, message: formatError(error) };        //return error message, will be used in useActionState()
  }
}