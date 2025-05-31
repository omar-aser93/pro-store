'use client';
import { Button } from '@/components/ui/button';
import { createPaymentIntent } from '@/lib/actions/order.actions';
import { formatCurrency } from '@/lib/utils';
import { Elements, LinkAuthenticationElement, PaymentElement, useElements, useStripe} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js/pure';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';


//StripePayment component, displays a Stripe payment form for a single order which the id is received as a prop
const StripePayment = ({ priceInCents, orderId }: { priceInCents: number; orderId: string;  }) => {
  
  const stripePromise = loadStripe( process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string );   // Load Stripe with the publishable key from .env
  const { theme, systemTheme } = useTheme();                               // A Hook to Get the current theme 
  const [clientSecret, setClientSecret] = useState<string | null>(null);   // Initialize clientSecret state 
  const [clientSecretErr, setClientSecretErr] = useState<string | null>(null);   // State to Track clientSecret errors

  // Fetch the Stripe client_secret when the component mounts
  useEffect(() => {
    const fetchPaymentIntent = async () => {
      const response = await createPaymentIntent(orderId);      //createPaymentIntent server action to get client_secret
      // If the response is successful, set the client secret state, otherwise set the error message
      if (response.client_secret) {
        setClientSecret(response.client_secret);        
      } else {
        setClientSecretErr(response.message || "Something went wrong.");
      }
    };
    fetchPaymentIntent();             // Call the function 
    
  }, [orderId]);

  // Check if clientSecret is null or has an error, to display loading / error message
  if (clientSecretErr) { return <div className="text-red-500">{clientSecretErr}</div>; }
  if (!clientSecret) { return <div>Loading payment details...</div>; }


  // Stripe custom Form sub-Component (we separate it, because it must be wrapped in Elements provider)
   const StripeForm = () => {
    const stripe = useStripe();                                        // Get the Stripe instance
    const elements = useElements();                                    // Get the Elements instance
    const [isLoading, setIsLoading] = useState(false);                 // Loading state for the form submission
    const [errorMessage, setErrorMessage] = useState<string>();        // Form Error message state
    const [email, setEmail] = useState<string>();                      // Email state

    // Handle StripeForm submission, we use stripe.confirmPayment() & pass return_url to redirect to the success page
    async function handleSubmit(e : React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      if (stripe == null || elements == null || email == null) return;
      setIsLoading(true);
      stripe.confirmPayment({ elements, confirmParams: { return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/order/${orderId}/stripe-payment-success` } })
        .then(({ error }) => { if (error) { setErrorMessage(error.message || "An unknown error occurred.") }})
        .finally(() => setIsLoading(false));
    }
    
    return (
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='text-xl'>Stripe Checkout</div>
        {errorMessage && <div className='text-destructive'>{errorMessage}</div>}
        <PaymentElement />
        {/* The Email that will get the order receipt */}
        <div><LinkAuthenticationElement onChange={(e) => setEmail(e.value.email)} /></div> 
        {/* Submit button with text of the order price, the button is disabled when loading */}
        <Button className='w-full' size='lg' disabled={stripe == null || elements == null || isLoading} >
          {isLoading ? 'Purchasing...' : `Purchase - ${formatCurrency(priceInCents / 100)}`}
        </Button>
      </form>
    );
  };


  // Return the Stripe form, wrapped in Elements provider
  return (
    <Elements stripe={stripePromise} options={{ clientSecret: clientSecret!, appearance: { theme: theme === 'dark' ? 'night' : theme === 'light' ? 'stripe' : systemTheme === 'light' ? 'stripe' : 'night' } }} >
      <StripeForm />
    </Elements>
  );
};

export default StripePayment;