import { Metadata } from 'next'
import Link from 'next/link'
import { getSubscribers, unsubscribeNewsletter } from '@/lib/actions/newsletter.actions'
import DeleteDialog from '@/components/shared/delete-dialog'
import Pagination from '@/components/shared/pagination'
import { formatDateTime } from '@/lib/utils'
import { History, SquarePen } from 'lucide-react'                  //icon lib auto-installed with shadcn/ui
//shadcn components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

//set page title to "Newsletter Subscribers"
export const metadata: Metadata = {
  title: 'Newsletter Subscribers',
}


const SubscribersPage = async (props: { searchParams: Promise<{ query: string; page: string }> }) => {
  
  const searchParams = await props.searchParams           //get All URL searchParams
  //pass (query,page number) to getSubscribers() server-action & set default values, also we can pass limit (items per page) if we want 
  const subscribers = await getSubscribers({ query: searchParams.query || '',  page: Number(searchParams.page) || 1 });

  return (
    <div className='space-y-2'>
      <div className='flex-between'> 
      {/* Header title + a Display/Remove Search Filter */}
        <div className='flex items-center gap-3'>
          <h1 className='h2-bold'>Subscribers</h1>
          {searchParams.query && (
            <div> Filtered by <i>&quot;{searchParams.query}&quot;</i>{' '}
              <Link href={`/admin/subscribers`}><Button variant='outline' size='sm'><span>X</span> Remove Filter </Button></Link>
            </div> 
          )}
        </div> 
        {/* Create Newsletter & Newsletters History Link, asChild is used with shadcn components that have button/Link child as trigger */}
        <div className='flex items-center gap-3'>
          <Button variant='default'>
            <History className='mx-1'/><Link href='/admin/newsletter/history'>Newsletters History</Link>
          </Button>
          <Button variant='default'>
            <SquarePen className='mx-1'/><Link href='/admin/newsletter/create'>Create Newsletter</Link>
          </Button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <Table>
         {/* Table Header */}
          <TableHeader>
            <TableRow>
              <TableHead className='rtl:text-right'>EMAIL</TableHead>
              <TableHead className='rtl:text-right'>NAME</TableHead>
              <TableHead className='rtl:text-right'>MEMBER SINCE</TableHead>              
              <TableHead className='text-center w-[100px]'>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          {/* Table Body, map through the fetched data to format & display them inside the table cells */}
          <TableBody>
            {subscribers.data.map((subscriber) => (
              <TableRow key={subscriber.id}>
                <TableCell> <Link href={`mailto:${subscriber.email}`} className="hover:underline text-blue-600"> {subscriber.email} </Link> </TableCell>
                <TableCell>{subscriber.name || '-'}</TableCell>
                <TableCell>{formatDateTime(subscriber.createdAt).dateTime}</TableCell>
                <TableCell className='flex gap-1'>
                  <DeleteDialog id={subscriber.newsletterToken!} action={unsubscribeNewsletter} />   {/* Delete modal component */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination, if total pages are more than 1 */}
        {subscribers.totalPages > 1 && (<Pagination page={Number(searchParams.page) || 1} totalPages={subscribers.totalPages} />)}
      </div>
    </div>
  )
}

export default SubscribersPage