import { Metadata } from 'next';
import Link from 'next/link';
import Charts from './charts';
import AdminCalendar from './admin-calendar';
import { getOrderSummary } from '@/lib/actions/order.actions';
import { formatCurrency, formatDateTime, formatNumber } from '@/lib/utils';
import { BadgeDollarSign, Barcode, CreditCard, Users } from 'lucide-react';      //icons lib auto installed with shadcn
import DownloadPdfButton from './DownloadPdfButton';
//shadcn components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';


//set page title to "Admin Dashboard"
export const metadata: Metadata = {
  title: 'Admin Overview',
};


//admin dashboard & statistics page
const AdminOverviewPage = async () => {
  
  const summary = await getOrderSummary();        //Get order summary server-action, to get Dashboard data

  return (
    <div className='space-y-2' id="pdf-content">
      {/* Title + Download PDF Button */}
      <div className='flex items-center justify-between'>
        <h1 className='h2-bold'>Dashboard</h1>
        <DownloadPdfButton />    
      </div>

      {/* grid of 4 cols on lg screen, 2 cols on md screen */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Total Revenue Card */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <BadgeDollarSign />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(summary.totalSales._sum.totalPrice!.toString())}</div>
          </CardContent>
        </Card>
        {/* Sales Count Card */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Sales</CardTitle>
            <CreditCard />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatNumber(summary.ordersCount)}</div>
          </CardContent>
        </Card>
        {/* Customers Count Card */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Customers</CardTitle>
            <Users />
          </CardHeader>
          <CardContent><div className='text-2xl font-bold'>{summary.usersCount}</div></CardContent>
        </Card>
        {/* Products Count Card */}
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Products</CardTitle>
            <Barcode />
          </CardHeader>
          <CardContent><div className='text-2xl font-bold'>{summary.productsCount}</div></CardContent>
        </Card>
      </div>

      {/* grid of 7 cols on lg screen, 2 col on md screen */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        {/* Sales_Overview Chart component, inside a Card */}
        <Card className='col-span-4'>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className='pl-2'><Charts data={{salesData: summary.salesData}}/></CardContent>
        </Card>
        {/* Latest 6 Sales Table, inside a Card */}
        <Card className='col-span-3'>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              {/* Table Header*/}
              <TableHeader>
                <TableRow>
                  <TableHead>BUYER</TableHead>
                  <TableHead>DATE</TableHead>
                  <TableHead>TOTAL</TableHead>
                  <TableHead>ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              {/* Table Body, map through the fetched data to format & display them inside the table cells */}
              <TableBody>
                {summary.latestOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.user?.name ? order.user.name : 'Deleted user'}</TableCell>
                    <TableCell>{formatDateTime(order.createdAt).dateOnly}</TableCell>
                    <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                    <TableCell>
                      <Button asChild variant='outline' size='sm'><Link href={`/order/${order.id}`}>Details</Link></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Admin Calendar Component */}
      <div className="py-8 dark:text-slate-700">
        <h2 className="text-2xl font-bold mb-1">Activity Calendar</h2>
        <AdminCalendar />
      </div>

    </div>
  );
};

export default AdminOverviewPage;

