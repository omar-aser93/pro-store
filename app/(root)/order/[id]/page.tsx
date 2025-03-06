import { getOrderById } from '@/lib/actions/order.actions';
import { notFound } from 'next/navigation';        //get not-found.tsx we created, from next/navigation (to use it manually)
import OrderDetailsTable from './order-details-table';
import { shippingAddressType } from '@/lib/validator';

//set page title to "Order Details"
export const metadata = {
  title: 'Order Details',
};


// Order Details Page, we set the [id] url params TS type (Promise<{ id: string }>)
const OrderDetailsPage = async (props: { params: Promise<{ id: string }> }) => {
  
  const { id } = await props.params;                   //get the id from the url params
  const order = await getOrderById(id);                //pass the order id to getOrderById() server-action
  if (!order) notFound();                              //if order not found, return the not-found.tsx page we created

  return (  
   //Pass the order data to the OrderDetailsTable component, shippingAddress have a specific type so we cast it to shippingAddressType to avoid TS error
   <OrderDetailsTable order={{ ...order, shippingAddress: order.shippingAddress as shippingAddressType }}  />);
};

export default OrderDetailsPage;