'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';   //`isRedirectError` function used to check if error is a redirect error
import { revalidatePath } from 'next/cache';            //used to revalidate the cache of a specific path (we use it with POST/PUT/DELETE actions)
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.actions';
import { cartItemType, insertOrderSchema, paymentResultType } from '../validator';           //import zod Schemas/types from validator.ts
import { prisma } from '@/db/prisma';
import { convertToPlainObject } from '../utils';            //utility function to convert Prisma objects to plain js objects
import { paypal } from '../paypal';


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



// Create a Paypal Order server-action, receives the order id and creates a paypal order
export async function createPayPalOrder(orderId: string) {
  try {    
    const order = await prisma.order.findFirst({ where: { id: orderId } });      //Get the order by id from the DB
    if (order) {      
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));    //Create a paypal order using paypal.createOrder()
      //Update the order with the paypal order id
      await prisma.order.update({ where: { id: orderId }, data: { paymentResult: { id: paypalOrder.id, email_address: '', status: '', pricePaid: '0',  }} });
      
      // Return the paypal order id & success message
      return { success: true, message: 'PayPal order created successfully', data: paypalOrder.id };
    } else {
      throw new Error('Order not found');             //if order not found throw an error
    }
  } catch {
    return { success: false, message: "Something went wrong, try again later" };    //if error, return error message
  }
}



// Approve Paypal Order server-action, receives the order id and the paypal order id
export async function approvePayPalOrder( orderId: string, data: { orderID: string }) {
  try {
    // Find the order in the database, if not found throw an error
    const order = await prisma.order.findFirst({ where: { id: orderId } })
    if (!order) throw new Error('Order not found')
    
    const captureData = await paypal.capturePayment(data.orderID)   //Check if order is already paid using paypal.capturePayment()
    //if not paid or the order id is not the same, throw an error
    if ( !captureData || captureData.id !== (order.paymentResult as paymentResultType)?.id || captureData.status !== 'COMPLETED' )  throw new Error('Error in paypal payment')
  
    // Call (Update order to paid) function, pass the order id and a payment result object
    await updateOrderToPaid({ 
      orderId, paymentResult: { id: captureData.id, status: captureData.status, email_address: captureData.payer.email_address, pricePaid: captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value }
    });

    revalidatePath(`/order/${orderId}`)                     //refresh the data on this page
    return { success: true, message: 'Your order has been successfully paid by PayPal'  }   //return success message
  } catch (error) {
    console.error('Error in approvePayPalOrder:', error); // Log the error for debugging
    return { success: false, message: "something went wrong, try again later" }     //if error, return error message
  }
}


//Function to Update Order to Paid in Database , used in approvePayPalOrder server-action
async function updateOrderToPaid({ orderId, paymentResult }: { orderId: string; paymentResult?: paymentResultType}) {
  //Find the order in the database and include the order items, if order is not found or already paid throw an error
  const order = await prisma.order.findFirst({ where: { id: orderId }, include: { orderItems: true } });
  if (!order) throw new Error('Order not found');
  if (order.isPaid) throw new Error('Order is already paid');

  // Create a prisma transaction to update the order and update products stock quantities (transaction is a way to ensure all operations are completed successfully or none of them are completed &  DB is left the same as before the transaction started)
  await prisma.$transaction(async (tx) => {
    // 1st: Update each item's stock quantities in the database
    for (const item of order.orderItems) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: -item.qty }} });
    }
    // 2nd: update the order in the database, by Setting isPaid to true
    await tx.order.update({ where: { id: orderId }, data: { isPaid: true, paidAt: new Date(), paymentResult } });
  });

  // Get the updated order after the transaction, if not found throw an error
  const updatedOrder = await prisma.order.findFirst({ where: { id: orderId }, include: { orderItems: true, user: { select: { name: true, email: true }} } });
  if (!updatedOrder) { throw new Error('Order not found');  }
};



//User's orders history server-action, receives limit & page values for pagination 
export async function getMyOrders({ limit = Number(process.env.NEXT_PUBLIC_PAGE_SIZE), page }: { limit?: number; page: number; }) {
  // Check if the user is authenticated, if not throw an error
  const session = await auth();
  if (!session) throw new Error('User is not authenticated');

  // Get the user's orders by his id from the database.
  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: 'desc' },           //order by createdAt in a descending order
    take: limit,                              //take the limit (items per page)
    skip: (page - 1) * limit,                 //paginate the data, skip (page number) * (items per page)
  });
  
  //get the total number of the user's orders, to calculate the total number of pages 
  const dataCount = await prisma.order.count({ where: { userId: session?.user?.id } });     

  return { data, totalPages: Math.ceil(dataCount / limit)        //res with data and the total number of pages
  };
}
