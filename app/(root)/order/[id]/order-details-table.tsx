'use client';

import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useTransition } from 'react';
import { Order } from '@/lib/validator';
import { approvePayPalOrder, createPayPalOrder, deliverOrder, updateOrderToPaidByCOD } from '@/lib/actions/order.actions';
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer} from '@paypal/react-paypal-js';    //react-paypal lib
import StripePayment from './stripe-form';
//shadcn components
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';



// OrderDetailsTable component, displays a table & a payment buttons for a single order which is received as a prop
const OrderDetailsTable = ({isAdmin, order, paypalClientId}: { isAdmin: boolean; order: Order; paypalClientId: string;}) => {
  
  const { toast } = useToast();                            //useToast hook to show toast messages
  const [isPending, startTransition] = useTransition();    //useTransition hook to handle a pending state
  //destructuring the recieved order data
  const { shippingAddress, orderItems, itemsPrice, taxPrice, shippingPrice, totalPrice, paymentMethod, isPaid, paidAt, isDelivered, deliveredAt, } = order;

  // Checks the loading status of the PayPal script
  function PrintLoadingState() {
    const [{ isPending, isRejected }] = usePayPalScriptReducer();     //usePayPalScriptReducer hook from react-paypal-js lib      
    let status = '';
    if (isPending) {
      status = 'Loading PayPal...';                   //if isPending, show loading message
    } else if (isRejected) {
      status = 'Error in loading PayPal.';            //if isRejected, show error message
    }
    return status;
  }

  // Creates a PayPal order using the createPayPalOrder server-action, if there is an error return a toast
  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id);
    if (!res.success) return toast({ description: res.message, variant: 'destructive' });    
    return res.data;    
  };

  // Approves a PayPal order using the approvePayPalOrder server-action , if succes/error return a toast
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data);    
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' });
  };


  return (
    <>
      <h1 className='py-4 text-2xl'> Order {formatId(order.id)}</h1>
      <div className='grid md:grid-cols-3 md:gap-5'>
        <div className='overflow-x-auto md:col-span-2 space-y-4'>
        {/* Payment Method Card */}    
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>Payment Method</h2>
            <p>{paymentMethod}</p>
            {isPaid ? ( <Badge variant='secondary'> Paid at {formatDateTime(paidAt!).dateTime} </Badge> ) 
                    : ( <Badge variant='destructive'>Not paid</Badge> )}
          </CardContent>
        </Card>
        {/* Shipping Address Card */}
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>Shipping Address</h2>
            <p>{shippingAddress.fullName}</p>
            <p>{shippingAddress.streetAddress}, {shippingAddress.city},{' '} {shippingAddress.postalCode}, {shippingAddress.country}{' '} </p>
            {isDelivered ? ( <Badge variant='secondary'> Delivered at {formatDateTime(deliveredAt!).dateTime} </Badge>)
                         : ( <Badge variant='destructive'>Not delivered</Badge> )}
          </CardContent>
        </Card>
        {/* Order Items Table */}
        <Card>
          <CardContent className='p-4 gap-4'>
            <h2 className='text-xl pb-4'>Order Items</h2>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
              {orderItems.map((item) => (
              <TableRow key={item.slug}>
                <TableCell>
                  <Link href={`/product/${item.slug}`} className='flex items-center' >
                    <Image src={item.image} alt={item.name} width={50} height={50} ></Image>
                    <span className='px-2'>{item.name}</span>
                  </Link>
                </TableCell>
                <TableCell>
                  <span className='px-2'>{item.qty}</span>
                </TableCell>
                <TableCell className='text-right'>${item.price}</TableCell>
              </TableRow>
              ))}
            </TableBody>
            </Table>
          </CardContent>
        </Card>
        </div>

        {/* Order Summary Card */}
        <div>
          <Card>
            <CardContent className='p-4 space-y-4 gap-4'>
              <h2 className='text-xl pb-4'>Order Summary</h2>
              <div className='flex justify-between'>
                  <div>Items</div>
                  <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className='flex justify-between'>
                  <div>Tax</div>
                  <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className='flex justify-between'>
                  <div>Shipping</div>
                  <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className='flex justify-between'>
                  <div>Total</div>
                  <div>{formatCurrency(totalPrice)}</div>
              </div>

              {/* PayPal Button.. we pass PrintLoadingState, createPayPalOrder and handleApprovePayPalOrder functions */}
              {!isPaid && paymentMethod === 'PayPal' && (
                <div>
                  <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                    <PrintLoadingState />
                    <PayPalButtons createOrder={handleCreatePayPalOrder} onApprove={handleApprovePayPalOrder} fundingSource="paypal"  />
                  </PayPalScriptProvider>
                </div> )}

              {/* Stripe form component, testing data(Card: 4242 4242 4242 4242, Expiry: 12/34, CVV: 123, ZIP: ANy 5 digits) */}
              {!isPaid && paymentMethod === 'Stripe' && (
                <StripePayment priceInCents={Number(order.totalPrice) * 100} orderId={order.id} /> )
              }

              {/* Cash On Delivery Button, only visible for admin and if the order is not paid */}
              {isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
              <Button type='button' disabled={isPending} onClick={() => startTransition(async () => {
                  const res = await updateOrderToPaidByCOD(order.id);     //pass order id to updateOrderToPaidByCOD() server-action   
                  toast({ variant: res.success ? 'default' : 'destructive', description: res.message });
                })}>
                {isPending ? 'processing...' : 'Mark As Paid'}
              </Button> )}
              {/* Mark As Delivered Button, only visible for admin and if the order is paid & not delivered */} 
              {isAdmin && isPaid && !isDelivered && (
              <Button type='button' disabled={isPending} onClick={() => startTransition(async () => {
                  const res = await deliverOrder(order.id);        //pass order id to deliverOrder() server-action
                  toast({ variant: res.success ? 'default' : 'destructive', description: res.message });
                })} >
                {isPending ? 'processing...' : 'Mark As Delivered'}
              </Button> )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default OrderDetailsTable;