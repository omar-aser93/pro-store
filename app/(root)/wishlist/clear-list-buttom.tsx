'use client'
import { useTransition } from 'react';
import { clearWishlist } from '@/lib/actions/wishlist.actions';  
import { Loader, Trash2 } from 'lucide-react';                    //icons lib auto installed with shadcn
//shadcn components
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';           

//Button component to clear the wishlist, separate from the wishlist page because it is a client component
const ClearWishList = () => {

  const { toast } = useToast();                  //useToast hook from shadcn, used to display a toast messages
  const [isPending, startTransition] = useTransition();   //useTransition hook to handle a pending state

  //handleClearWishlist function, called when the button is clicked
  const handleClearWishlist = () => {
    startTransition(async() => {                  //start the transition
      const res = await clearWishlist();          //call the clearWishlist server-action
      if (!res.success) { toast({ variant: "destructive", description: res.message }) }   //if failed, display a toast error message
      else { toast({ description: res.message }) }     //if success, display a toast success message
   })
  }
  return (
    //Button to clear wishlist, passing the handleClearWishlist function for onClick event .. disabled if isPending
    <Button className="px-3" variant="destructive" disabled={isPending} onClick={ handleClearWishlist  }>
      <Trash2/> {isPending ? <><Loader className="w-4 h-4 animate-spin" /> Clearing...</> : ( "Clear Wishlist" )}
    </Button>
  )
}

export default ClearWishList