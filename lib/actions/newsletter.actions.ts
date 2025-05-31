"use server"

import { prisma } from '@/db/prisma';
import { sendWelcomeNewsletterEmail, sendNewsletterEmail } from "@/email";
import { auth } from "@/auth";
import crypto from "crypto";
import { revalidatePath } from 'next/cache';        //used to revalidate the cache of a specific path (we use it with POST/PUT/DELETE actions)
import { Prisma } from '@prisma/client';


//subscribe to newsletter server-action, receives the user's email
export async function subscribeToNewsletter(email: string) {
  //get user by email from db, if not found throw error 
  const existingUser = await prisma.user.findUnique({ where: { email } });     
  if (!existingUser) { throw new Error("User not found. Please create an account first."); }

  //if usre's newsletterSubscribed is `true`, return "already subscribed"
  if (existingUser?.newsletterSubscribed) { throw new Error("You're already subscribed") }

  //random token to secure unsubscribe links, example: yourdomain.com/unsubscribe?token=abc123, you can identify which user made the request whithout expose his id
  const token = crypto.randomBytes(10).toString("hex");

  // Update the (newsletterSubscribed, ewsletterToken) for the existing user
  await prisma.user.update({ where: { email }, data: { newsletterSubscribed: true, newsletterToken: token }});

  // Send welcome email using the resend email we created
  await sendWelcomeNewsletterEmail(email, token);
}



//unsubscribe from newsletter server-action, receives the user's newsletter token
export async function unsubscribeNewsletter(token: string) {
  try {
  // Based on user's newsletter token, Update the user's (newsletterSubscribed) to false 
  await prisma.user.updateMany({ where: { newsletterToken: token }, data: { newsletterSubscribed: false } });
  revalidatePath('/admin/newsletter');                   //Revalidate admin newsletter page to get fresh data
  return { success: true, message: "You have successfully unsubscribed from our newsletter." };     //res with success message
  } catch (error) {     
    return { success: false, message: error instanceof Error ? error.message : "Failed to unsubscribe, try again later" };    //res with error message
  }
}



// Get All Subscribers server-action (Admin page), receives query for search + limit & page values for pagination
export async function getSubscribers({ query, limit = Number(process.env.NEXT_PUBLIC_PAGE_SIZE), page }: { query: string; limit?: number; page: number;}) {
  //create a filter object.. Only select users where newsletterSubscribed is true, then If a search query is provided, filter by name or email
  const queryFilter: Prisma.UserWhereInput = { newsletterSubscribed: true, ...(query && query !== "all" && {
        OR: [{ name: { contains: query, mode: "insensitive" } }, { email: { contains: query, mode: "insensitive" } }],
      }),
    };

  // Find & Get All the subscribed user from the database using Prisma.findMany()
  const data = await prisma.user.findMany({
    where: queryFilter,                            //Apply the filter
    orderBy: { createdAt: "desc" },                //order by createdAt in a descending order
    take: limit,                                   //take the limit (items per page)
    skip: (page - 1) * limit,                      //paginate the data, skip (page number) * (items per page)
    //include the needed data from the user model 
    select: { id: true, name: true, email: true, createdAt: true, newsletterSubscribed: true, newsletterToken: true },
  });

  //get the total number of subscribed users with the filters applied, to calculate total pages
  const dataCount = await prisma.user.count({ where: queryFilter });     
  return { data, totalPages: Math.ceil(dataCount / limit) };     //res with data and the total number of pages
}



// Get All Newsletters server-action (Admin page), receives limit & page values for pagination
export async function getNewsletters({ limit = Number(process.env.NEXT_PUBLIC_PAGE_SIZE), page }: { limit?: number; page: number }) {
  const data = await prisma.newsletter.findMany({
    orderBy: { createdAt: 'desc' },                        //order by createdAt in a descending order
    take: limit,                                           //take the limit (items per page)
    skip: (page - 1) * limit,                              //paginate the data, skip (page number) * (items per page)
    include: { author: { select: { name: true } } },       //include the author name
  })

  const dataCount = await prisma.newsletter.count()     //get the total number of newsletters to calculate the total number of pages
  return { data, totalPages: Math.ceil(dataCount / limit) }          //res with data and the total number of pages
}



// Delete a Newsletter server-action, receives the newsletter id to delete
export async function deleteNewsletter(id: string) {
  try {
    //get current user from the session, if not admin or not found throw error
    const session = await auth(); 
    if (!session?.user || session?.user?.role !== "admin") throw new Error("Unauthorized")

    //delete the newsletter from the database using prisma
    await prisma.newsletter.delete({ where: { id } });
    revalidatePath('/admin/newsletter/history');         //Revalidate admin newsletter history page to get fresh data

    return { success: true, message: "Newsletter deleted successfully" };     //res with success message
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "Failed to delete newsletter, try again later" };    //res with error message
  }
}



//Admin create newsletter server-action, receives (newsletter data) as it will be used to create a new newsletter email
export async function createNewsletter({ subject, content, attachments = [] }: { subject: string; content: string; attachments?: { url: string; name: string }[]; }) {
  //get current user from the session, if not admin or not found throw error
  const session = await auth(); 
  if (!session?.user || session?.user?.role !== "admin") throw new Error("Unauthorized")

  //get all subscribers from the database, where each user's newsletterSubscribed is `true` 
  const subscribers = await prisma.user.findMany({ where: { newsletterSubscribed: true }, select: { email: true, newsletterToken: true } });

  // create new newsletter record in the DB
  const newsletter = await prisma.newsletter.create({ data: { subject, content, attachments , authorId: session.user.id!, sentCount: subscribers.length } });

  // Sending emails with Batching logic
  // `BATCH_SIZE = 50` You send emails in chunks of 50 to avoid being flagged as spam or hitting rate limits by the email provider.
  const BATCH_SIZE = 50  
  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {            
    const batch = subscribers.slice(i, i + BATCH_SIZE) ;             // Slice the subscribers array into batches    
    await sendNewsletterEmail({ batch, subject, content, attachments });          //send newsletter email for current batch 

    // Rate limiting: (setTimeout) Wait 1 second after each batch to slow things down for both Resend and your own server.
    if (i + BATCH_SIZE < subscribers.length) { await new Promise(resolve => setTimeout(resolve, 1000)) }
  }

  return newsletter              //res with the created newsletter
}