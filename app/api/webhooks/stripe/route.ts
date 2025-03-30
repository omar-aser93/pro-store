/* https://docs.stripe.com/webhooks/quickstart?lang=node , A webhook is a way for a service to notify another service when something happens.
- this is a route file that will listen for the Stripe payment event and then update & mark the order as paid our database. */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { updateOrderToPaid } from '@/lib/actions/order.actions';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);        // Initialize Stripe with the secret API key from env 

// Define the POST handler function for the Stripe webhook
export async function POST(req: NextRequest) {
  // Construct the event using the raw request body, the Stripe signature header, and the webhook secret.
  // This ensures that the request is indeed from Stripe and has not been tampered with.
  const event = await stripe.webhooks.constructEvent(
    await req.text(), req.headers.get('stripe-signature') as string, process.env.STRIPE_WEBHOOK_SECRET as string
  );
  
  // charge.succeeded indicates a successful payment
  if (event.type === 'charge.succeeded') {    
    const { object } = event.data;             // Retrieve the order ID from the payment metadata
    // Update the order status to paid server action, we pass the order ID and payment details
    await updateOrderToPaid({
      orderId: object.metadata.orderId,
      paymentResult: { id: object.id, status: 'COMPLETED', email_address: object.billing_details.email!, pricePaid: (object.amount / 100).toFixed() },
    });
    return NextResponse.json({ message: 'updateOrderToPaid was successful' });   //if success, return success message
  }
  return NextResponse.json({ message: 'event is not charge.succeeded' });        //if error, return failure message
}