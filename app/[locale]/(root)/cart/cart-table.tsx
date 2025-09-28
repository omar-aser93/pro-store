'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { addItemToCart, clearCart, removeItemFromCart } from '@/lib/actions/cart.actions';
import { ArrowRight, Loader, Minus, Plus, Trash2 } from 'lucide-react';         //icons lib auto installed with shadcn  
import Image from 'next/image';
import Link from 'next/link';
import { Cart } from '@/lib/validator';                        //zod schema type for Cart
import { formatCurrency } from '@/lib/utils';                  //utility function to format currency
//shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


// CartTable component, receives the cart as a prop
const CartTable = ({ cart }: { cart?: Cart }) => {

  const router = useRouter();                    //useRouter hook to navigate to a page
  const { toast } = useToast();                  //useToast hook from shadcn, used to display a toast messages
  //useTransition hook, we wrap startTransition() around content of async function, then use isPending to to display a loading indicator
  const [isPending, startTransition] = useTransition();    

  return (
    <>
      <h1 className='py-4 h2-bold'>Shopping Cart</h1>
      {/*if cart is empty, display a message with a link to Home, otherwise display the cart table */}
      {!cart || cart.items.length === 0 ? 
        ( <div> Cart is empty. <Link href='/'>Go shopping</Link> </div> ) : (
        <div className='grid md:grid-cols-4 md:gap-5'>      {/* grid of 5 cols, span-3 for the table, span-2 for checkout card */}
          <div className='overflow-x-auto md:col-span-3'>
          <Table>
            {/* table Header */}
            <TableHeader>
              <TableRow>
                <TableHead className='rtl:text-right'>Item</TableHead>
                <TableHead className='text-center'>Color/Size Options</TableHead>
                <TableHead className='text-center'>Quantity</TableHead>
                <TableHead className='text-right'>Price</TableHead>
              </TableRow>
            </TableHeader>
            {/* table Body */}
            <TableBody>
              {/*map through cart items, display image, name, price, qty and buttons to remove/add items */}  
              {cart.items.map((item) => (
                <TableRow key={`${item.slug}-${item.color!}-${item.size!}`}>
                  <TableCell>
                    <Link href={`/product/${item.slug}`} className='flex items-center' >
                      <Image src={item.image} alt={item.name} width={50} height={50} />
                      <span className='px-2'>{item.name}</span>
                    </Link>
                  </TableCell>
                  {item.color ? <TableCell >
                    <div className='flex items-center justify-center gap-3'>
                      <div style={{ backgroundColor: item.color! }} className="w-5 h-5 rounded-full" /> 
                      <div>{item.size}</div>
                    </div>
                  </TableCell> : <TableCell className='text-center'>-</TableCell> }
                  <TableCell className='flex-center gap-2'>
                    <Button disabled={isPending} variant='outline' type='button'
                        onClick={() => startTransition(async () => {
                            const res = await removeItemFromCart(item.productId, item.color!, item.size!);
                            if (!res.success) { toast({ variant: 'destructive', description: res.message }) }
                          })
                        }>
                      {isPending ? ( <Loader className='w-4 h-4 animate-spin' /> ) : ( <Minus className='w-4 h-4' /> )}
                    </Button>
                    <span className='px-3'>{item.qty}</span>
                    <Button disabled={isPending} variant='outline' type='button'
                        onClick={() => startTransition(async () => {
                            const res = await addItemToCart(item);
                            if (!res.success) { toast({ variant: 'destructive', description: res.message }) }
                          })
                        }>
                      {isPending ? ( <Loader className='w-4 h-4 animate-spin' /> ) : ( <Plus className='w-4 h-4' /> )}
                    </Button>
                  </TableCell>
                  <TableCell className='text-right'>${item.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>

          {/* Checkout Card, display subtotal using .reduce((a, c) => a + c.qty, 0), a accumulator (initially 0), a + c.qty adds the current item's qty to the accumulator ..
            ex: const cart = { items: [ { id: 1, name: "Apple", qty: 2 }, { id: 2, name: "Banana", qty: 3 } ] };  ..  0 + 2 = 2, then 2 + 3 = 5
            also, display total price using formatCurrency() utility function & button to redirect to checkout multi-steps */}
          <Card>
            <CardContent className='p-4 gap-4'>
              <div className='pb-3 text-xl'>
                Subtotal ({cart.items.reduce((a, c) => a + c.qty, 0)}):
                <span className='font-bold'> {formatCurrency(cart.itemsPrice)} </span>
              </div>
              {/* Button to redirect to other checkout steps pages */}
              <Button className='w-full' disabled={isPending} onClick={() => startTransition(() => router.push('/shipping-address'))}>
                {isPending ? (<Loader className='w-4 h-4 animate-spin' />) : (<ArrowRight className='w-4 h-4' /> )} Proceed to Checkout
              </Button>
              {/* Button to clear cart, if clicked, call clearCart() server-action, if success, display success toast, if error, display error toast */}
              <Button className="w-full mt-4" variant="destructive" disabled={isPending} 
                  onClick={() => startTransition(async () => {
                       const res = await clearCart();
                       if (!res.success) { toast({ variant: "destructive", description: res.message }) }
                       else { toast({ description: res.message }) }
                      })
                }>
                <Trash2/> {isPending ? <><Loader className="w-4 h-4 animate-spin" /> Clearing...</> : ( "Clear Cart" )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default CartTable;