'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';   //`isRedirectError` function used to check if error is a redirect error
import { auth, signIn, signOut } from '@/auth';      //import the signIn and signOut functions from auth.ts
import { sendOTPEmail } from "@/email";              //import (resend lib) sendOTPEmail Function we created
import { revalidatePath } from 'next/cache';         //used to revalidate the cache of a specific path (we use it with POST/PUT/DELETE actions)
//import zod Schemas/types from validator.ts
import { forgotPasswordType, otpType, paymentMethodSchema, paymentMethodType, resetPasswordType, shippingAddressSchema, shippingAddressType, signInType, signUpType, updateUserType} from '../validator';     
import { hashSync } from 'bcrypt-ts-edge';           //hashing function from bcrypt-ts library
import { prisma } from '@/db/prisma';                //import the Prisma object from prisma.ts, the file we created
import { Prisma } from '@prisma/client';             //import the Prisma client


// Sign in the user with email/password server-action, receives the form data .. prevState is used with useActionState() in the form component
export async function signInWithCredentials(prevState: unknown, data: signInType) {
  try {      
    await signIn("credentials",{ ...data, redirect: false });      //pass received user credentials to Next_Auth signIn() function     
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



// Register a new user server-action, receives the form data .. prevState is used with useActionState() in the form component
export async function signUp(prevState: unknown, data: signUpType) {
  try { 
    //check if the user already exists in the db, then return error message that will be used in useActionState()
    const isExists = await prisma.user.findUnique({ where: { email: data.email } });    
    if (isExists) { return { success: false, message: 'User already exists' }; }

    const plainPassword = data.password;               //store the password before hashing (Next_Auth login doesn't take hashed passwords)
    data.password = hashSync(data.password, 10);       //hash the password to secure it before saving it in the DB 
    
    //create the user in the db using Prisma (with the data we recieved & hashed password)
    await prisma.user.create({ data: { name: data.name, email: data.email, password: data.password } });
     //pass user credentials to Next_Auth signIn() function .. redirect: false to prevent Next_Auth from redirecting (it doesn't change the URL)
    await signIn('credentials', { email: data.email, password: plainPassword, redirect: false });   
    
    return { success: true, message: 'User created successfully' };                 //return success message, will be used in useActionState()
  } catch (error) {
    if (isRedirectError(error)) { throw error; }  
    return { success: false, message: 'Registration failed, Try again later' };     //return error message, will be used in useActionState()
  }
}



//send otp for forgot password server-action, receives the form data .. prevState is used with useActionState() in the form component
export async function sendForgotPasswordOTP(prevState: unknown, data: forgotPasswordType) {
  try{
    //check if the user exists in the db, if not return error message 
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) { return { success: false, message: 'User doesn\'t exist' }; }

    //generate a random OTP and set it to expire in 10 minutes
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    //update the user's OTP and expiration date in the db using Prisma & passing the generated OTP and expiration date
    await prisma.user.update({ where: { email: data.email }, data: { otp, otpExpires } });
    await sendOTPEmail(data.email, otp);         //send OTP email using the (resend lib) sendOTPEmail function we created
    
    return { success: true, message: 'OTP sent successfully' };        //return success message, will be used in useActionState()
  } catch (error) {
    if (isRedirectError(error)) { throw error; }  
    return { success: false, message: 'Failed to send OTP, Try again later' };    //return error message, will be used in useActionState()
  }
}



// Verify OTP server-action, receives the form data .. prevState is used with useActionState() in the form component
export async function verifyOTP(prevState: unknown, data: otpType) {
  try{
    //check if the user exists in the db and if the recieved OTP is the same as the one in the db, if not return error message
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user || user.otp !== data.otp) { return { success: false, message: "Invalid OTP" }; }
    //check if the OTP is expired, if yes return error message
    if (user.otpExpires && new Date() > user.otpExpires) { return { success: false, message: "OTP expired" }; }
    
    return { success: true, message: 'OTP verified successfully' };        //return success message, will be used in useActionState()
  } catch (error) {
    if (isRedirectError(error)) { throw error; }
    return { success: false, message: 'Failed to verify OTP, Try again later' };   //return error message, will be used in useActionState()
  }
}



// Reset password server-action, receives the form data .. prevState is used with useActionState() in the form component
export async function resetPassword(prevState: unknown, data: resetPasswordType) {
  try {
    //check if the user exists in the db, if not return error message
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) { return { success: false, message: 'User doesn\'t exist' }; }

    const hashedPassword = hashSync(data.newPassword, 10);     //hash the new password to secure it before saving it in the DB
    //update the user's password in the db using Prisma & passing the hashed password & resetting the OTP 
    await prisma.user.update({ where: { email: data.email }, data: { password: hashedPassword, otp: null, otpExpires: null } });
 
    return { success: true, message: 'Password reset successfully' };        //return success message, will be used in useActionState()
  } catch (error) {
    if (isRedirectError(error)) { throw error; }    
    return { success: false, message: 'Failed to reset password, Try again later' };   //return error message, will be used in useActionState()
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
    //update the user's address data in the db using Prisma & passing the recieved address formData
    await prisma.user.update({ where: { id: currentUser.id }, data: { address } }); 
    return { success: true, message: 'User updated successfully' };                //return success message
  } catch {
    return { success: false, message: 'Failed to update address, try again later' };   //return error message
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
    //update the user's payment method in the db using Prisma & passing the recieved payment method formData
    await prisma.user.update({ where: { id: currentUser.id }, data: { paymentMethod: paymentMethod.type },});
    return { success: true, message: 'User updated successfully', };                  //return success message
  } catch {
    return { success: false, message: 'Failed to update payment method, try again later'  };    //return error message
  }
}



// Update User's Profile server-action
export async function updateProfile(user: { name: string; email: string }) {
  try {
    // Get current user's session to get his ID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;

    //get the current user by ID from the db using Prisma, if not found throw error
    const currentUser = await prisma.user.findFirst({ where: { id: userId } });
    if (!currentUser) throw new Error('User not found');

    //update the user's profile in the db using Prisma & passing the recieved profile form Data
    await prisma.user.update({ where: { id: currentUser.id }, data: { name: user.name, } });
    return { success: true, message: 'User updated successfully', };                  //return success message
  } catch {
    return { success: false, message: 'Failed to update profile info, try again later'  };     //return error message
  }
}



// Get all users server-action (Admin page), receives query for search + limit & page values for pagination
export async function getAllUsers({query, limit = Number(process.env.NEXT_PUBLIC_PAGE_SIZE), page }: { query: string; limit?: number; page: number;}) {
  //create a filter object.. checks if we recieved a search query, then return object contains the filter {key: query_value}  
  const queryFilter: Prisma.UserWhereInput = query && query !== 'all' ? { name: { contains: query, mode: 'insensitive' } as Prisma.StringFilter } : {};
  // Find & Get all the Users from the database using Prisma.findMany()
  const data = await prisma.user.findMany({
    where: { ...queryFilter },                           //Apply the filter 
    orderBy: { createdAt: 'desc' },                      //order by createdAt in a descending order
    take: limit,                                         //take the limit (items per page)
    skip: (page - 1) * limit,                            //paginate the data, skip (page number) * (items per page)
  });

   //get the total number of users with the filters applied, to calculate total pages
  const dataCount = await prisma.user.count({where: { ...queryFilter }});          
  return { data, totalPages: Math.ceil(dataCount / limit) };     //res with data and the total number of pages
}



// Delete user by ID server-action
export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });        //delete the user from the DB by id
    revalidatePath('/admin/users');                     //Revalidate admin users page to get fresh data
    return { success: true, message: 'User deleted successfully' };       //if success, return success message
  } catch {
    return { success: false, message: 'Failed to delete user, try again later' };    //if error, return error message
  }
}



// Update user by ID server-action, recieves the form data & update use's data with it
export async function updateUser(user: updateUserType) {
  try {
    await prisma.user.update({ where: { id: user.id }, data: { name: user.name, role: user.role } });  //update user data in the DB by id
    revalidatePath('/admin/users');                                      //Revalidate admin users page to get fresh data
    return { success: true, message: 'User updated successfully' };      //if success, return success message
  } catch {
    return { success: false, message: 'Failed to update user, try again later' };    //if error, return error message
  }
}