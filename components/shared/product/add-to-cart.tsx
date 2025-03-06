'use client';
import { useRouter } from 'next/navigation';
import { Plus, Minus, Loader } from 'lucide-react';              //icons lib auto installed with shadcn
import { addItemToCart, removeItemFromCart } from '@/lib/actions/cart.actions';
import { Cart, cartItemType } from '@/lib/validator';
import { useTransition } from 'react';
//shadcn components
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';


// AddToCart component, receives a product item as a prop
const AddToCart = ({ cart, item }: { cart: Cart | undefined; item: cartItemType; }) => {
  
  const router = useRouter();                    //useRouter hook to navigate to a page
  const { toast } = useToast();                  //useToast hook from shadcn, used to display a toast messages
  //useTransition hook, we wrap startTransition() around conent of async function, then use isPending to to display a loading indicator
  const [isPending, startTransition] = useTransition();     

  //handleAddToCart function, called when the AddToCart button is clicked
  const handleAddToCart = async () => {    
    startTransition(async () => { 
      const res = await addItemToCart(item);           //Execute addItemToCart server-action & pass the product

      // if not successful, Display error toast message (coming from the server-action) 
      if (!res.success) { 
        toast({ variant: 'destructive', description: res.message });
        return;                     //return out to stop the function
      }

      // if success, Display success toast message (description) & action button to navigate to cart page using router.push()
      toast({
        description: res.message,
        action: (
          <ToastAction onClick={() => router.push('/cart')} className='bg-primary text-white hover:bg-gray-800' altText='Go to cart' >
            Go to cart
          </ToastAction>
        ),
      });
    });
  };


  //handleRemoveFromCart function, called when the Remove button is clicked
  const handleRemoveFromCart = async () => {
    startTransition(async () => { 
      const res = await removeItemFromCart(item.productId);    //Execute removeItemFromCart server-action & pass the product ID

      // if not successful, Display error toast message (coming from the server-action)
      toast({
        variant: res.success ? 'default' : 'destructive',
        description: res.message,
      });
      return;   //return out to stop the function
    });
  };


  //check if item exists in the cart
  const existItem = cart && cart.items.find((x) => x.productId === item.productId); 

  //if item exists in the cart, render Add/Remove buttons with onClick event handler, if not render only the Add button 
  return existItem ? (
    <div>
      <Button type='button' variant='outline' disabled={isPending} onClick={handleRemoveFromCart}>
      {isPending ? (<Loader className='w-4 h-4  animate-spin' />) : (<Minus className='w-4 h-4' />)}
      </Button>
      <span className='px-3'>{existItem.qty}</span>
      <Button type='button' variant='outline' disabled={isPending} onClick={handleAddToCart}> 
      {isPending ? (<Loader className='w-4 h-4 animate-spin' />) : (<Plus className='w-4 h-4' />)} 
      </Button>
    </div>
  ) : (
    <Button className='w-full' type='button' disabled={isPending} onClick={handleAddToCart}>
      {isPending ? (<Loader className='w-4 h-4 animate-spin' />) : (<Plus className='w-4 h-4' />)} Add to cart
    </Button>
  );
};

export default AddToCart;