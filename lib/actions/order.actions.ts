'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';   //`isRedirectError` function used to check if error is a redirect error
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.actions';
import { cartItemType, insertOrderSchema } from '../validator';           //import zod Schemas/types from validator.ts
import { prisma } from '@/db/prisma';
import { convertToPlainObject } from '../utils';            //utility function to convert Prisma objects to plain js objects


// Create an order server-action
export async function createOrder() {
  try {
    //Check if user is authenticated, in Cart actions we didn't check because guest users can add items to cart, but only logged users can checkout
    const session = await auth();
    if (!session) throw new Error('User is not authenticated');
    //Get user by ID, if not found throw an error  
    const userId = session?.user?.id;
    if (!userId) throw new Error('User not found');

    //use the id to get the user by the getUserById server-action, also get user cart by getMyCart server-action
    const user = await getUserById(userId);
    const cart = await getMyCart();

    //Check if cart is empty, if user has no address or payment method, return a message with a redirect link
    if (!cart || cart.items.length === 0) {
      return { success: false, message: 'Your cart is empty', redirectTo: '/cart' };
    }
    if (!user.address) {
      return { success: false, message: 'Please add a shipping address', redirectTo: '/shipping-address' };
    }
    if (!user.paymentMethod) {
      return { success: false, message: 'Please select a payment method', redirectTo: '/payment-method' };
    }

    //parse the insertOrderSchema data using zod schema
    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    /*Create a prisma transaction to create the order & order items in the db ,
     a transaction is a way to ensure that all its operations are completed successfully or none of them are completed & the DB is left the same as before the transaction started.
     example: withdrawing money from an ATM, if the transaction fails at any point, the money is not deducted from your account.
     - `prisma.$transaction` method takes a callback function that takes `tx` parameter. it binds these operations together,
       any query using `tx` will be rolled back if an error occurs in any part of the transaction block. (So you won't end up with an order with some items and some items not in the order) */
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const insertedOrder = await tx.order.create({ data: order });                 //create the order in the db
      //loop through the cart items and create an order item for each item in the db
      for (const item of cart.items as cartItemType[]) {
        await tx.orderItem.create({ data: {...item, price: item.price, orderId: insertedOrder.id} });
      }
      //clear the cart & make it be empty after creating the order
      await tx.cart.update({ where: { id: cart.id }, data: { items: [], totalPrice: 0, shippingPrice: 0, taxPrice: 0, itemsPrice: 0 } });
      return insertedOrder.id;           //res with the order id
    });

    if (!insertedOrderId) throw new Error('Order not created');      //if order not created throw an error
    return { success: true, message: 'Order successfully created', redirectTo: `/order/${insertedOrderId}` };  //return success message with redirect link
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: 'Something went wrong, try again later' };      //return error message
  }
}



// Get order by ID server-action, receives the order id and returns the order includes the order items and user details
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: { id: orderId },
    include: { orderItems: true, user: { select: { name: true, email: true } } },
  });
  return convertToPlainObject(data);             //res with all of the order's info
}