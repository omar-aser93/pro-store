'use server';

import { prisma } from '@/db/prisma';
import { auth } from '@/auth'
import { revalidatePath } from 'next/cache';    //used to revalidate the cache of a specific path (we use it with POST/PUT/DELETE actions)


// toggle the wishlist item server-action, receives the product Id 
export async function toggleWishlist(productId: string) {
  try {  
    // Get the current user's ID from the session, if not authenticated, return error message
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { success: false, message: 'Not authenticated, login first to add to wishlist' };

    // Find & Fetch the wishlist product for the current user's wishlist from the database
    const existing = await prisma.wishlist.findFirst({ where: { userId, productId } });

    // check If the item exists in the current user's wishlist
    if (existing) {
        await prisma.wishlist.delete({ where: { id: existing.id } });     //Delete the existing item from the wishlist
        revalidatePath('/wishlist');                                      //Revalidate the wishlist page to fetch fresh data
        return { success: true, message: 'Item Removed from wishlist' };  //if success return success message
    } else {
        await prisma.wishlist.create({ data: { userId, productId } });  //Create a new wishlist item
        revalidatePath('/wishlist');                                    //Revalidate the wishlist page to fetch fresh data
        return { success: true, message: 'Item Added to wishlist' };    //if success return success message
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    return { success: false, message: 'failed to update wishlist, try again later' };  //if error return error message
  }
}



// get the wishlist items for the authenticated user server-action
export async function getWishlist() {
  // Get the current user's ID from the session, if not authenticated, return error message
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, message: 'Not authenticated' };

  // Find & Fetch the wishlist items for the current user from the database, including product details
  const wishlist = await prisma.wishlist.findMany({ where: { userId }, include: { product: true } });
  return wishlist;             // Return the wishlist 
}



// clear the wishlist server-action
export async function clearWishlist() {
  try {
    // Get the current user's ID from the session, if not authenticated, return an error message
    const session = await auth();  
    if (!session?.user?.id) { return { success: false, message: 'Not authenticated' }; }  //if not authenticated, return error message
  
    // Delete all wishlist items for the current user from the database
    await prisma.wishlist.deleteMany({ where: { userId: session.user.id } });  
    revalidatePath('/wishlist');           // Revalidate the wishlist page to fetch fresh data
    return { success: true, message: 'Wishlist cleared successfully' };  // If success, return success message
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    return { success: false, message: 'Failed to clear wishlist' };     // If error, return error message
  }
}
