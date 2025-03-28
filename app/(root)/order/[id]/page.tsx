import { getOrderById } from '@/lib/actions/order.actions';
import { notFound } from 'next/navigation';        //get not-found.tsx we created, from next/navigation (to use it manually)
import OrderDetailsTable from './order-details-table';
import { auth } from '@/auth';
import { shippingAddressType } from '@/lib/validator';

//set page title to "Order Details"
export const metadata = {
  title: 'Order Details',
};


// Order Details Page, we set the [id] url params TS type (Promise<{ id: string }>)
const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  
  const session = await auth();                     //get user session using auth() hook, to check isAdmin & pass it
  const { id } = await props.params;                //get the order id from the url params
  const order = await getOrderById(id);             //pass the order id to getOrderById() server-action
  if (!order) notFound();                           //if order not found, return the not-found.tsx page we created

  return (  
   //Pass isAdmin, the order data to the OrderDetailsTable component, shippingAddress have a specific type so we cast it to shippingAddressType to avoid TS error
   //we also pass PAYPAL_CLIENT_ID.. because it doesn't have NEXT_PUBLIC_ prefix, so we can only access it in server-component
   <OrderDetailsTable 
     isAdmin={session?.user.role === 'admin' || false}
     order={{ ...order, shippingAddress: order.shippingAddress as shippingAddressType }}     
     paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}     
   />
  );
};

export default OrderDetailsPage;