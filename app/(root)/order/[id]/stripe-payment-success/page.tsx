import { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';      //get not-found.tsx we created, from next/navigation (to use it manually)
import Stripe from 'stripe';
import { getOrderById } from '@/lib/actions/order.actions';
import { Button } from '@/components/ui/button';                     //shadcn components

//set page title to "Stripe Payment Success"
export const metadata: Metadata = {
  title: 'Stripe Payment Success',
};


// SuccessPage page, displays a success message after a successful payment
const SuccessPage = async (props: { params: Promise<{ id: string }>; searchParams: Promise<{ payment_intent: string }>; }) => {

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);    // Create a Stripe instance
  // Get the order id and payment intent id from the URL params and searchParams
  const { id } = await props.params;
  const { payment_intent: paymentIntentId } = await props.searchParams;

  // Fetch order by id server-action, if not found return our custom 404 page
  const order = await getOrderById(id);
  if (!order) notFound();

  // Retrieve the payment intent & Check if the payment intent is valid 
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if ( paymentIntent.metadata.orderId == null || paymentIntent.metadata.orderId !== order.id.toString()) { return notFound(); }

  // Check if the payment intent is successful, if not redirect to the order page
  const isSuccess = paymentIntent.status === 'succeeded';
  if (!isSuccess) return redirect(`/order/${id}`);

  return (
    <div className='max-w-4xl w-full mx-auto space-y-8'>
      <div className='flex flex-col gap-6 items-center '>
        <h1 className='h1-bold'>Thanks for your purchase</h1>
        <div>We are now processing your order.</div>
        <Button asChild>
          <Link href={`/order/${id}`}>View order</Link>
        </Button>
      </div>
    </div>
  );
};

export default SuccessPage;