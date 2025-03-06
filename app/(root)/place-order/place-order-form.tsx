'use client';
import { Check, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createOrder } from '@/lib/actions/order.actions';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';

const PlaceOrderForm = () => {
  const router = useRouter();                              //useRouter hook to navigate to a page
  const [isPending, startTransition] = useTransition();    //useTransition hook to handle a pending state

  //function to handle button submit
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();    
    startTransition(async () => {
      const res = await createOrder();                         //server-action to create an order
      if (res.redirectTo) { router.push(res.redirectTo); }     //if success, redirect to a page (we get it from res)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <Button disabled={isPending} className="w-full">
        {isPending ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Place Order
      </Button>
    </form>
  );
};

export default PlaceOrderForm;