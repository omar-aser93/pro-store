'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';   //`isRedirectError` function used to check if error is a redirect error
import { revalidatePath } from 'next/cache';            //used to revalidate the cache of a specific path (we use it with POST/PUT/DELETE actions)
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.actions';
import { calendarSummarySchema, CalendarSummaryType, cartItemType, insertOrderSchema, paymentResultType, shippingAddressType } from '../validator';      //import zod Schemas/types from validator.ts
import { prisma } from '@/db/prisma';
import { convertToPlainObject } from '../utils';           //utility function to convert Prisma objects to plain js objects
import { paypal } from '../paypal';
import { Prisma } from '@prisma/client';
import Stripe from 'stripe';
import { sendPurchaseReceipt } from '@/email';            //import the sendPurchaseReceipt Function we created


//Function to Update Order to Paid in the DB, used inside (Stripe webhook) + (approvePayPalOrder, updateOrderToPaidByCOD) server-actions
export async function updateOrderToPaid({ orderId, paymentResult }: { orderId: string; paymentResult?: paymentResultType}) {
  //Find the order in the database and include the order items, if order is not found or already paid throw an error
  const order = await prisma.order.findFirst({ where: { id: orderId }, include: { orderItems: true } });
  if (!order) throw new Error('Order not found');
  if (order.isPaid) throw new Error('Order is already paid');

  // Create a prisma transaction to update the order and update products stock quantities (transaction is a way to ensure all operations are completed successfully or none of them are completed &  DB is left the same as before the transaction started)
  await prisma.$transaction(async (tx) => {
    // 1st: Update each item's stock quantities in the database
    for (const item of order.orderItems) { 
      // Get the product by id, if not found throw an error
      const product = await tx.product.findFirst({ where: { id: item.productId } });
      if (!product) throw new Error("Product not found");
      // Get the variant stock if the item has color & size (the item is a variant)
      let colors = (product.colors as { name: string; sizes: { size: string; stock: number }[] }[]) || [];

      // If the item has color & size (is a variant), check & update the specific variant stock, otherwise, update the main product stock
      if (item.color && item.size) {       
        colors = colors.map((c) => 
          c.name === item.color ? { ...c, sizes: c.sizes.map((s) => {
            if (s.size === item.size) {
              if (s.stock < item.qty) throw new Error(`Not enough stock for this variant (${item.color} - ${item.size})`);
              return { ...s, stock: s.stock - item.qty };
            }
            return s;
          })} : c
        );
        await tx.product.update({ where: { id: product.id }, data: { colors, stock: { decrement: item.qty } } });
      } else {
        if (product.stock < item.qty) throw new Error("Not enough stock");
        await tx.product.update({ where: { id: product.id }, data: { stock: { decrement: item.qty } } });
      }
    }
    // 2nd: update the order in the database, by Setting isPaid to true
    await tx.order.update({ where: { id: orderId }, data: { isPaid: true, paidAt: new Date(), paymentResult } });
  });
  // Get the updated order after the transaction, if not found throw an error
  const updatedOrder = await prisma.order.findFirst({ where: { id: orderId }, include: { orderItems: true, user: { select: { name: true, email: true }} } });
  if (!updatedOrder) { throw new Error('Order not found'); }
  // Send the purchase receipt email with the updated order, shippingAddress/paymentResult have a specific types so we cast them to their type to avoid TS error
  sendPurchaseReceipt({ order: {...updatedOrder, shippingAddress: updatedOrder?.shippingAddress as shippingAddressType, paymentResult: updatedOrder?.paymentResult as paymentResultType }});  
};



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
    return { success: false, message: 'Failed to create order, try again later' };      //return error message
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
    return { success: false, message: "Failed to create PayPal order, try again later" };    //if error, return error message
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
    return { success: false, message: "Failed to approve PayPal order, try again later" }    //if error, return error message
  }
}



//Stripe create payment intent server-action, receives the order id and the stripe client secret
export async function createPaymentIntent(orderId: string) {
  // Find the order in the database, if not found throw an error
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");
  // Check if the payment method is not Stripe or if order is paid, then throw an error
  if (order.paymentMethod !== "Stripe" || order.isPaid) { throw new Error("Invalid payment request"); } 

  // Initialize Stripe instance with the secret key from environment variables
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  try { 
    // Create a Stripe payment intent using the Stripe API, passing total price in cents & order id as metadata
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(Number(order.totalPrice) * 100), currency: "USD", metadata: { orderId: order.id },
    });  
    return { client_secret: paymentIntent.client_secret };         // Return the client secret of the payment intent
  } catch (error) {
    console.error('Error in createPaymentIntent:', error);         // Log the error for debugging
    return { success: false, message: "Failed to create payment intent, try again later" };    //if error, return error message
  } 
}



//Update Order to Paid for (Cash On Delivery) Server-action 
export async function updateOrderToPaidByCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });                 // Call (Update order to paid) function, pass the order id 
    revalidatePath(`/order/${orderId}`);                  //Revalidate admin orders page to get fresh data
    return { success: true, message: 'Order paid successfully' };           //if success, return success message
  } catch {
    return { success: false, message: 'Failed to update order, try again later' };   //if error, return error message
  }
}



// Update Order To Delivered server-action
export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({ where: { id: orderId } });       //Find the order in the DB by id
    if (!order) throw new Error('Order not found');                               //if not found, throw an error
    if (!order.isPaid) throw new Error('Order is not paid');                      //if not paid, throw not-paid error

    // Update the order by id, to delivered & set the deliveredAt date 
    await prisma.order.update({ where: { id: orderId }, data: { isDelivered: true, deliveredAt: new Date() }});
    
    revalidatePath(`/order/${orderId}`);                        //Revalidate admin orders page to get fresh data
    return { success: true, message: 'Order delivered successfully' };      //if success, return success message
  } catch {
    return { success: false, message: 'something went wrong, try again later' };    //if error, return error message
  }
}



//User's orders history server-action (user's Orders page), receives limit & page values for pagination 
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



// Admin Dashboard statistics server-action, Get sales data & order summary
export async function getOrderSummary() {
  // Get counts for each resource
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  // Calculate total sales, `aggregate` method for summing up the totalPrice field across all orders.
  const totalSales = await prisma.order.aggregate({ _sum: { totalPrice: true } });

  // Get monthly sales data (grouped by month & year [formatted as MM/YY]), `$queryRaw` method for raw SQL queries 
  const salesDataRaw = await prisma.$queryRaw<Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

   // inside the salesDataRaw array of objects we fetched, We Convert every totalSales value from Decimal to number
  const salesData: { month: string; totalSales: number; }[] = salesDataRaw.map((entry) => ({ month: entry.month, totalSales: Number(entry.totalSales) }));

  // Get latest sales using findMany(), order by createdAt in a desc order, take last 6 items, include related user model data
  const latestOrders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } }}, take: 6 });

  return { ordersCount, productsCount, usersCount, totalSales, latestOrders, salesData };   //res with all the data we calculated
}



// Get All Orders server-action (Admin page), receives query for search + limit & page values for pagination
export async function getAllOrders({query, limit = Number(process.env.NEXT_PUBLIC_PAGE_SIZE), page }: {query: string; limit?: number; page: number; }) {
  //create a filter object.. checks if we recieved a search query, then return object contains the filter {key: query_value}  
  const queryFilter: Prisma.OrderWhereInput = query && query !== 'all' ? { user: { name: { contains: query, mode: 'insensitive' } as Prisma.StringFilter }} : {};
  // Find & Get All the orders from the database using Prisma.findMany()
  const data = await prisma.order.findMany({
    where: { ...queryFilter },                             //Apply the filter 
    orderBy: { createdAt: 'desc' },                        //order by createdAt in a descending order
    take: limit,                                           //take the limit (items per page)
    skip: (page - 1) * limit,                              //paginate the data, skip (page number) * (items per page)
    include: { user: { select: { name: true } } },         //include the user model data
  });

  //get the total number of orders with the filters applied, to calculate total pages
  const dataCount = await prisma.order.count({where: { ...queryFilter }});   
  return { data, totalPages: Math.ceil(dataCount / limit) };       //res with data and the total number of pages
}



// Delete Order server-action, receives the order id
export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({ where: { id } });                 //delete the order by id from the database
    revalidatePath('/admin/orders');                              //Revalidate admin orders page to get fresh data
    return { success: true, message: 'Order deleted successfully' };       //if success res with success message       
  } catch {
    return { success: false, message: "Failed to delete order, try again later" };    //if error res with error message
  }
}



// Get Calendar Summary server-action, receives month to get orders & products for that month
export async function getCalendarSummary(input: CalendarSummaryType) {
  //parse the calendar received input data using zod schema
  const { startDate, endDate } = calendarSummarySchema.parse(input);

  // Create Date objects for the month's start and end dates
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);

  // Fetch products added in range (the start & end dates)
  const products = await prisma.product.findMany({
    where: { createdAt: { gte: start, lte: end } },
    select: { id: true, name: true, createdAt: true, },
    orderBy: { createdAt: "asc" },
  });

  // Fetch orders created in range (the start & end dates)
  const orders = await prisma.order.findMany({
    where: { createdAt: { gte: start, lte: end } },    
    select: { id: true, createdAt: true, isPaid: true, isDelivered: true, totalPrice: true },
    orderBy: { createdAt: "asc" },
  });

  // Group results by date and convert Date objects to strings
  const summary: Record<string,
    { products: { id: string; name: string }[];
      orders: { id: string; createdAt: string; isPaid: boolean; isDelivered: boolean; totalPrice: string; }[];
    }> = {};

  // Loop through products to group them by date
  for (const product of products) {
    const dateKey = product.createdAt.toISOString().split("T")[0];
    if (!summary[dateKey]) summary[dateKey] = { products: [], orders: [] };
    summary[dateKey].products.push({
      id: product.id,
      name: product.name,
    });
  }
  // Loop through orders to group them by date
  for (const order of orders) {
    const dateKey = order.createdAt.toISOString().split("T")[0];
    if (!summary[dateKey]) summary[dateKey] = { products: [], orders: [] };
    summary[dateKey].orders.push({
      id: order.id,
      createdAt: order.createdAt.toISOString(), // Convert Date to string
      isPaid: order.isPaid,
      isDelivered: order.isDelivered,
      totalPrice: order.totalPrice.toString(),
    });
  }

  return summary;                    //return the summary
}