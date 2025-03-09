'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';   //`isRedirectError` function used to check if error is a redirect error
import { auth, signIn, signOut } from '@/auth';           //import the signIn and signOut functions from auth.ts
//import zod Schemas/types from validator.ts
import { paymentMethodSchema, paymentMethodType, shippingAddressSchema, shippingAddressType, signInType, signUpType} from '../validator';     
import { hash } from '../encrypt';                   //hashing using function we manually created (encrypt.ts file)
import { prisma } from '@/db/prisma';                //import the Prisma client from prisma.ts, the file we created
import { cookies } from 'next/headers';


// Sign in the user with email/password server-action
export async function signInWithCredentials(prevState: unknown, data: signInType) {
  try {      
    await signIn("credentials", data);               //pass received user credentials to Next_Auth signIn() function 
       
    // Handle persisting the guest cart when user signs in
    const cookiesObject = await cookies();                              //Get Nextjs cookies
    const sessionCartId = cookiesObject.get('sessionCartId')?.value;    //Get sessionCartId cookie for the guest cart
    if (sessionCartId) {
      // Find the guest cart by the sessionCartId
      const sessionCart = await prisma.cart.findFirst({ where: { sessionCartId } });
      if (sessionCart) {
        const user = await prisma.user.findFirst({ where: { email: data.email }});    //get the user by email
        // clear & Delete any existing user cart
        await prisma.cart.deleteMany({ where: { userId: user?.id } });
        // Assign the guest cart to the logged-in user
        await prisma.cart.update({ where: { id: sessionCart.id }, data: { userId: user?.id } });
      }
    }
    return { success: true, message: "Signed in successfully" };   //return success message, will be used in useActionState()
  } catch (error) {
    if (isRedirectError(error)) { throw error; }
    return { success: false, message: "Invalid email or password" };   //return error message, will be used in useActionState()
  }
}



// Sign the user out server-action
export async function signOutUser() {
  await signOut({redirect: true});                       //Next_Auth signOut() function    
}



// Register a new user server-action
export async function signUp(prevState: unknown, data: signUpType) {
  try { 
    //check if the user already exists in the db, then return error message that will be used in useActionState()
    const isExists = await prisma.user.findUnique({ where: { email: data.email } });    
    if (isExists) { return { success: false, message: 'User already exists' }; }

    const plainPassword = data.password;              //store the password before hashing (Next_Auth login doesn't take hashed passwords)
    data.password = await hash(data.password);        //hash the password
    
    //create the user in the db using Prisma (with the data we recieved & hashed password)
    await prisma.user.create({ data: { name: data.name, email: data.email, password: data.password } });
    await signIn('credentials', { email: data.email, password: plainPassword });    //pass user credentials to Next_Auth signIn() function 
    
    // Handle persisting the guest cart when user signs up
    const cookiesObject = await cookies();                              //Get Nextjs cookies
    const sessionCartId = cookiesObject.get('sessionCartId')?.value;    //Get sessionCartId cookie for the guest cart
    if (sessionCartId) {
      // Find the guest cart by the sessionCartId
      const sessionCart = await prisma.cart.findFirst({ where: { sessionCartId } });
      if (sessionCart) {
        const user = await prisma.user.findFirst({ where: { email: data.email }});    //get the user by email
        // clear & Delete any existing user cart
        await prisma.cart.deleteMany({ where: { userId: user?.id } });
        // Assign the guest cart to the logged-in user
        await prisma.cart.update({ where: { id: sessionCart.id }, data: { userId: user?.id } });
      }
    }
    
    return { success: true, message: 'User created successfully' };                 //return success message, will be used in useActionState()
  } catch (error) {
    if (isRedirectError(error)) { throw error; }  
    return { success: false, message: 'Registration failed, Try again later' };     //return error message, will be used in useActionState()
  }
}



// Get user by ID server-action (Next_Auth session doesn't include all user data, so sometimes we need to fetch from the db)
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  return user;
}



// Update user address server-action
export async function updateUserAddress(data: shippingAddressType) {
  try {
    const session = await auth();         //get the user session from Next_Auth
    //get the current user by ID from the db using Prisma, if not found throw error
    const currentUser = await prisma.user.findFirst({ where: { id: session?.user?.id } });
    if (!currentUser) throw new Error('User not found');

    const address = shippingAddressSchema.parse(data);          //parse the address data using zod schema
    //update the user's address data in the db using Prisma & pass the recieved address formData
    await prisma.user.update({ where: { id: currentUser.id }, data: { address } }); 
    return { success: true, message: 'User updated successfully' };                //return success message
  } catch {
    return { success: false, message: 'something went wrong, try again later' };   //return error message
  }
}



// Update user's payment method server-action
export async function updateUserPaymentMethod( data: paymentMethodType) {
  try {
    // Get current user's session to get his ID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    //get the current user by ID from the db using Prisma, if not found throw error
    const currentUser = await prisma.user.findFirst({ where: { id: userId }, });
    if (!currentUser) throw new Error('User not found');

    const paymentMethod = paymentMethodSchema.parse(data);       //parse the payment method data using zod schema
    //update the user's payment method in the db using Prisma & pass the recieved payment method formData
    await prisma.user.update({ where: { id: currentUser.id }, data: { paymentMethod: paymentMethod.type },});
    return { success: true, message: 'User updated successfully', };                  //return success message
  } catch {
    return { success: false, message: 'something went wrong, try again later'  };     //return error message
  }
}