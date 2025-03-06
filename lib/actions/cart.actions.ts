/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";        //revalidatePath to purge cached data on-demand for a specific path.
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { cartItemType, cartItemSchema, insertCartSchema } from "../validator";    //import the zod Schemas & types
import { prisma } from "@/db/prisma";                       //import the Prisma client from prisma.ts, the file we created
import { convertToPlainObject, round2 } from "../utils";    //utility functions to convert & format objects
import { Prisma } from "@prisma/client";                                 //will need it for some Prisma types


// Function to accurately Round & Calculate cart prices, will be used inside the cart server-actions
const calcPrice = (items: cartItemType[]) => {
  const itemsPrice = round2(items.reduce((acc, item) => acc + Number(item.price) * item.qty, 0)),
    shippingPrice = round2(itemsPrice > 100 ? 0 : 10),
    taxPrice = round2(0.15 * itemsPrice),
    totalPrice = round2(itemsPrice + taxPrice + shippingPrice);
  
  return { itemsPrice: itemsPrice.toFixed(2), shippingPrice: shippingPrice.toFixed(2), taxPrice: taxPrice.toFixed(2), totalPrice: totalPrice.toFixed(2) };
};



// Add item to cart server-action, receives a cart item as a parameter
export async function addItemToCart(data: cartItemType) {
  try {
    // Check for stored guest cart cookie, if not found, throw an error .. we created this cookie in auth.ts (NextAuth)
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart Session not found");

    // Get current user's session to get his ID
    const session = await auth();
    const userId = session?.user?.id ? (session.user.id as string) : undefined;
    
    const cart = await getMyCart();              // Get user's cart using getMyCart() server-action    
    const item = cartItemSchema.parse(data);     // Parse and validate submitted product with Zod schema
    // Find the product by Id in the database, if not found, throw an error
    const product = await prisma.product.findFirst({ where: { id: item.productId } });
    if (!product) throw new Error("Product not found");

    // If user doesn't have a cart, create a new one and add the item to it
    if (!cart) {
      // validate and Create new cart object
      const newCart = insertCartSchema.parse({ userId: userId, items: [item], sessionCartId: sessionCartId, ...calcPrice([item]) });
      await prisma.cart.create({ data: newCart });        // Add the new cart to the database       
      revalidatePath(`/product/${product.slug}`);         // Revalidate product page to get fresh data      
      return { success: true, message: `${product.name} added to your cart successfully` };   // Return success message
    // If user has a cart, update it with the new item
    } else {   
      // Check if submitted item already exists in the cart, using .find()
      const existItem = (cart.items as cartItemType[]).find((x) => x.productId === item.productId);      
      if (existItem) {       
        // If not enough stock (considering the quantity of the item already in the cart), then throw an error 
        if (product.stock < existItem.qty + 1) { throw new Error('Not enough stock') }   
        // Increase quantity of existing item
        (cart.items as cartItemType[]).find((x) => x.productId === item.productId)!.qty = existItem.qty + 1;
      } else {    // If item not in the cart & enough stock, add item to cart        
        if (product.stock < 1) throw new Error('Not enough stock');          // If not enough stock, throw error
        cart.items.push(item);         // Append item to the cart.items
      }

      // update user's cart in the database
      await prisma.cart.update({
        where: { id: cart.id },
        data: { items: cart.items as Prisma.CartUpdateitemsInput[], ...calcPrice(cart.items as cartItemType[]) },
      });

      revalidatePath(`/product/${product.slug}`);        // Revalidate product page to get fresh data 
      return { success: true, message: `${product.name} ${ existItem ? 'updated in' : 'added to'} cart successfully` };
    }  
  } catch (error:any) {    
    return { success: false, message: typeof error.message === 'string' ? error.message : JSON.stringify(error.message) };
  }
}



// Get user's cart server-action
export async function getMyCart() {
  // Check for stored cart cookie, if not found, throw an error .. we created this in auth.ts (NextAuth)
  const sessionCartId = (await cookies()).get("sessionCartId")?.value;
  if (!sessionCartId) throw new Error("Cart Session not found");

  // Get current user's session to get his ID
  const session = await auth();
  const userId = session?.user?.id ? (session.user.id as string) : undefined;

  // Get user cart from database, if user logged in, use userId, if not, use sessionCartId stored cookie
  const cart = await prisma.cart.findFirst({ where: userId ? { userId: userId } : { sessionCartId: sessionCartId } });
  if (!cart) return undefined;

  // Return & Convert values for compatibility with AddToCart component
  return convertToPlainObject({
    ...cart,
    items: cart.items as cartItemType[],
    itemsPrice: cart.itemsPrice.toString(),
    totalPrice: cart.totalPrice.toString(),
    shippingPrice: cart.shippingPrice.toString(),
    taxPrice: cart.taxPrice.toString(),
  });
}



//removeItemFromCart server-action, receives a product ID as a parameter
export async function removeItemFromCart(productId: string) {
  try {
    // Check for stored cart cookie, if not found, throw an error .. we created this cookie in auth.ts (NextAuth)
    const sessionCartId = (await cookies()).get("sessionCartId")?.value;
    if (!sessionCartId) throw new Error("Cart Session not found");

    // Find the product by Id in the database, if not found, throw an error
    const product = await prisma.product.findFirst({ where: { id: productId } });
    if (!product) throw new Error("Product not found");
    
    // Get user's cart using getMyCart() server-action , if not found, throw an error
    const cart = await getMyCart();               
    if (!cart) throw new Error("Cart not found");

    // Check if the item of this id exists in the cart, using .find()
    const exist = (cart.items as cartItemType[]).find((x) => x.productId === productId );
    if (!exist) throw new Error("Item not found");

    // Check if only one in qty, if so, remove & filter it from the cart, if not, decrease qty by 1
    if (exist.qty === 1) {      
      cart.items = (cart.items as cartItemType[]).filter((x) => x.productId !== exist.productId );
    } else {      
      (cart.items as cartItemType[]).find((x) => x.productId === productId)!.qty = exist.qty - 1;
    }

    // Update cart in database
    await prisma.cart.update({
      where: { id: cart.id },
      data: { items: cart.items as Prisma.CartUpdateitemsInput[], ...calcPrice(cart.items as cartItemType[]) },
    });

    revalidatePath(`/product/${product.slug}`);        // Revalidate product page to get fresh data 
    return { success: true, message: `${product.name} was removed from cart` };
  } catch (error:any) {    
    return { success: false, message: typeof error.message === 'string' ? error.message : JSON.stringify(error.message) };
  }
}
