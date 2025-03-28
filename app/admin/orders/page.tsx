import { Metadata } from 'next';
import Link from 'next/link';
import { deleteOrder, getAllOrders } from '@/lib/actions/order.actions';
import DeleteDialog from '@/components/shared/delete-dialog';
import Pagination from '@/components/shared/pagination';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
//shadcn table
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';   
import { Button } from '@/components/ui/button';

//set page title to "Admin Orders"
export const metadata: Metadata = {
  title: 'Admin Orders',
};


//orders page, to display All orders (with pagination & search filter) .. props: { searchParams: Promise<{}> } is how to get searchParams in server-component
const OrdersPage = async (props: { searchParams: Promise<{ query: string; page: string }> }) => {

  const searchParams = await props.searchParams;           //get All URL searchParams
  //pass (query,page number) to getAllOrders() server-action & set default values, also we can pass limit (items per page) if we want 
  const orders = await getAllOrders({ query: searchParams.query || '', page: Number(searchParams.page) || 1 });

  return (
    <div className='space-y-2'>
      {/* Header title + a Display/Remove Search Filter */}
      <div className='flex items-center gap-3'>
        <h1 className='h2-bold'>Orders</h1>
        {searchParams.query && (
        <div> Filtered by <i>&quot;{searchParams.query}&quot;</i>{' '}
          <Link href={`/admin/orders`}><Button variant='outline' size='sm'> <span>X</span> Remove Filter </Button></Link>
        </div> )}
      </div>

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
                <TableCell>{order.isPaid && order.paidAt ? formatDateTime(order.paidAt).dateTime : <span className='text-red-500'>not paid</span>}</TableCell>
                <TableCell>{order.isDelivered && order.deliveredAt ? formatDateTime(order.deliveredAt).dateTime : <span className='text-red-500'>not delivered</span>}</TableCell>
                <TableCell>
                  <Button variant='outline' size='sm'>
                    <Link href={`/order/${order.id}`}>Details</Link>             {/* single order Link */}
                  </Button>
                  <DeleteDialog id={order.id} action={deleteOrder} />            {/* Delete modal component */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination, if total pages are more than 1 */}
        {orders.totalPages > 1 && (<Pagination page={Number(searchParams.page) || 1} totalPages={orders?.totalPages} />)}
      </div>
    </div>
  )
}

export default OrdersPage