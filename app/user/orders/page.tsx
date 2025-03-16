import { Metadata } from 'next';
import Link from 'next/link';
import { getMyOrders } from '@/lib/actions/order.actions';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';   //shadcn table
import Pagination from '@/components/shared/pagination';

//set page title to "Shipping Address"
export const metadata: Metadata = {
  title: 'Orders History',
};
 

//orders page, to display user's orders history (with pagination) .. props: { searchParams: Promise<{}> } is how to get searchParams in server-component
const OrdersPage = async (props: { searchParams: Promise<{ page: string }> }) => {

  const { page } = await props.searchParams;                       //get page_number param from the URL searchParams
  //pass page number to getMyOrders() server-action & set default page number to 1, also we can pass limit (items per page) if we want 
  const orders = await getMyOrders({ page: Number(page) || 1 });   


  return (
    <div className='space-y-2'>
    <h2 className='h2-bold'>Orders</h2>
    <div className='overflow-x-auto'>
      <Table>
        {/* Table Header */}
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>DATE</TableHead>
            <TableHead>TOTAL</TableHead>
            <TableHead>PAID</TableHead>
            <TableHead>DELIVERED</TableHead>
            <TableHead>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body, map through the fetched data to format & display them inside the table cells */}
        <TableBody>
          {orders.data.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{formatId(order.id)}</TableCell>
              <TableCell>{formatDateTime(order.createdAt).dateTime}</TableCell>
              <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
              <TableCell>
                {order.isPaid && order.paidAt ? formatDateTime(order.paidAt).dateTime : <span className='text-red-500'>not paid</span> }
              </TableCell>
              <TableCell>
                {order.isDelivered && order.deliveredAt ? formatDateTime(order.deliveredAt).dateTime : <span className='text-red-500'>not delivered</span> }
              </TableCell>
              <TableCell>
                <Link href={`/order/${order.id}`}> <span className='py-1 px-2 bg-black text-white rounded-md'>Details</span> </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination, if total pages are more than 1 */}
      { orders.totalPages > 1 && ( <Pagination page={Number(page) || 1} totalPages={orders?.totalPages} /> )}
    </div>
  </div>
  );
};
  
export default OrdersPage;