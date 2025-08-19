'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';                //icon library auto installed by shadcn
//Shadcn components
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';

//Modal component for deleting item, it recieves the id of the item and the server-action to delete it
export default function DeleteDialog({ id, action }: { id: string; action: (id: string) => Promise<{ success: boolean; message: string }>; }) {
  
  const [open, setOpen] = useState(false);                  //state to check if modal is open or closed
  const { toast } = useToast();                             //use toast hook to show success/error messages (shadcn)
  const [isPending, startTransition] = useTransition();     //useTransition() hook to allow pending state while submitting/event
  
  // Handle delete order button click, with transition wraps the server-action
  const handleDeleteClick = () => {
    startTransition(async () => {
      const res = await action(id);                //pass the id to the server-action to delete the order
      if (!res.success) {
        toast({ variant: 'destructive', description: res.message });         //if error, show error toast
      } else {
        //if success, close the modal and show success toast
        setOpen(false);                            
        toast({ description: res.message });
      }
    });
  };

  return (
    //shadcn Alert Dialog, takes open_state & setOpen as props
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* Delete button that opens the Dialog - asChild is used with shadcn components that have button/Link child as trigger */}  
      <AlertDialogTrigger asChild>        
        <Button size='sm' variant='outline'><Trash2 className="text-red-500 hover:scale-110 transition-all cursor-pointer" /> Delete </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        {/* Dialog Header Text */}
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        {/* Dialog Footer Buttons */}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button variant='destructive' size='sm' disabled={isPending} onClick={handleDeleteClick}>
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}