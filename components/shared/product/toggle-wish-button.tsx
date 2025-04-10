'use client';
import { useTransition } from 'react';
import { Heart } from 'lucide-react';             // icon library auto installed with shadcn
import { toggleWishlist } from '@/lib/actions/wishlist.actions';
//shadcn components
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// ToggleWishButton component allows users to toggle the product to the wishlist
const ToggleWishButton = ({ productId, isFavorited }: { productId: string; isFavorited: boolean }) => {
  
  const [pending, startTransition] = useTransition();         // useTransition hook to handle a pending state
  const { toast } = useToast();                               // useToast() hook to use the toast notification system

  // Function to handle the click event of the wishlist items toggle button
  const handleClick = () => {
    startTransition(async () => {                     // startTransition to handle the pending state
      const res = await toggleWishlist(productId);    // toggleWishlist server-action, pass the productId to it
      // if the server-action returns success, show success toast, else show error toast
      if (res.success) {
        toast({ description: res.message });
      } else {        
        toast({ variant: 'destructive', description: res.message }); 
    }})
  };

  return (
    <div title='Wishlist'>
      <Button variant="ghost" size="icon" disabled={pending} onClick={handleClick} >        
        {pending ? <Heart className="h-5 w-5 animate-spin opacity-75" /> : <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} /> } 
      </Button>      
    </div>
  );
};

export default ToggleWishButton;