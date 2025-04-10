"use server";

import { revalidatePath } from 'next/cache';            //used to revalidate the cache of a specific path (we use it with POST/PUT/DELETE actions)
import { auth } from '@/auth';                          //import the auth function from auth.ts
import { prisma } from '@/db/prisma';                   //import the Prisma client from prisma.ts, the file we created       
import { insertReviewSchema, Review } from "../validator";     //import zod Schemas/types from validator.ts


// Create & Update Review server-action, receives review form data
export async function createUpdateReview(data: Review) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    const review = insertReviewSchema.parse({ ...data, userId: session?.user.id });  //parse and validate submitted review with Zod schema

    // Get the product being reviewed by its ID, if not found, throw an error
    const product = await prisma.product.findFirst({ where: { id: review.productId } });
    if (!product) throw new Error("Product not found");

    // Check if user has already reviewed this product (by the current user id & the product id)
    const reviewExists = await prisma.review.findFirst({ where: { productId: review.productId, userId: review.userId } });

    // If review exists, Create a prisma transaction to update the review, otherwise create a new one
    //(transaction) is a way to ensure all operations are completed successfully or none of them are completed & DB is left the same as before the transaction started
    await prisma.$transaction(async (tx) => {
      if (reviewExists) {
        // 1st: Update the review
        await tx.review.update({
          where: { id: reviewExists.id },
          data: { description: review.description, title: review.title, rating: review.rating },
        });
      } else {  
        // 1st (alternative): Create a new review      
        await tx.review.create({ data: review });           
      }

      // 2nd: Get the average rating
      const averageRating = await tx.review.aggregate({ _avg: { rating: true }, where: { productId: review.productId } });

      // 3rd: Get the number of reviews
      const numReviews = await tx.review.count({ where: { productId: review.productId } });

      // 4th: Update (rating & number of reviews) After creating/updating the review
      await tx.product.update({
        where: { id: review.productId },
        data: { rating: averageRating._avg.rating || 0, numReviews: numReviews },
      });
    });

    revalidatePath(`/product/${product.slug}`);        //Revalidate the product page to get fresh data
    return { success: true, message: "Review updated successfully" };           //if success, return success message
  } catch {
    return { success: false, message: "Failed to update review" };              //if error, return error message
  }
}



// Get all reviews for a product by it's ID (server-action)
export async function getReviews({ productId }: { productId: string }) {
  const data = await prisma.review.findMany({
    where: { productId: productId },                        //get all reviews from the DB by the product ID
    include: { user: { select: { name: true }} },           //include the related user who wrote the review
    orderBy: { createdAt: "desc" },                         //order the reviews by createdAt in descending order
  });
  return { data };
}



// Get the review written by current user for this product (server-action)... to set deafault values in update form
export const getReviewByProductId = async ({ productId }: { productId: string; }) => {
  // Check if user is authenticated, if not throw an error
  const session = await auth();
  if (!session) throw new Error("User is not authenticated");
  //res with the review written by the current user for this product
  return await prisma.review.findFirst({ where: { productId, userId: session?.user.id } });
};



// Delete a review server-action (by it's ID)
export async function deleteReview(id: string) {
  try {    
    // Check if user is authenticated, if not throw an error
    const session = await auth();
    if (!session) throw new Error("User is not authenticated");

    // get the review by it's ID, if not found, throw an error
    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) throw new Error("Review not found");

    // Ensure the current user is the owner of the review
    if (review.userId !== session.user.id) { throw new Error("Unauthorized action") }

    // Create a prisma transaction to Delete the review & update product stats
    //(transaction) is a way to ensure all operations are completed successfully or none of them are completed & DB is left the same as before the transaction started
    await prisma.$transaction(async (tx) => { await tx.review.delete({ where: { id } });   //1st: delete the review

      // 2nd & 3rd : Recalculate average rating and number of reviews
      const averageRating = await tx.review.aggregate({ _avg: { rating: true }, where: { productId: review.productId } });
      const numReviews = await tx.review.count({ where: { productId: review.productId } });

      // Update (rating & number of reviews) for the product
      await tx.product.update({ where: { id: review.productId }, data: { rating: averageRating._avg.rating || 0, numReviews }});
    });

    revalidatePath(`/product/${review.productId}`);            //Revalidate the product page to get fresh data
    return { success: true, message: "Review deleted successfully" };                //if success, return success message
  } catch {
    return { success: false, message: "Failed to delete review, try again later" };  //if error, return error message
  }
}



