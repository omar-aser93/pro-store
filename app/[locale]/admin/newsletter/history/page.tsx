import { Metadata } from 'next'
import Link from 'next/link'
import { deleteNewsletter, getNewsletters } from '@/lib/actions/newsletter.actions'
import { formatDateTime } from '@/lib/utils'
import Pagination from '@/components/shared/pagination'
import DeleteDialog from '@/components/shared/delete-dialog'
import { SquarePen } from 'lucide-react'          //icon lib auto-installed with shadcn/ui
//shadcn components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'

//set page title to "Newsletter History"
export const metadata: Metadata = {
  title: 'Newsletter History',
}


const NewsletterHistoryPage = async (props: { searchParams: Promise<{ page: string }> }) => {
  
  //get All URL searchParams
  const searchParams = await props.searchParams
  //pass (page number) to getSubscribers() server-action & set default values, also we can pass limit (items per page) if we want 
  const newsletters = await getNewsletters({ page: Number(searchParams.page) || 1 })

  return (
    <div className='space-y-4'>
      {/* Page title & create new button */}
      <div className='flex-between'>
        <h1 className='h2-bold'>Newsletter History</h1>
        <Button variant='default'>
          <SquarePen className='mx-2'/> <Link href='/admin/newsletter/create'>Create New</Link>
        </Button>
      </div>

      <div className='overflow-x-auto'>
        <Table>
         {/* Table Header */}
          <TableHeader>
            <TableRow>
              <TableHead>SUBJECT</TableHead>
              <TableHead>RECIPIENTS</TableHead>
              <TableHead>SENT AT</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
         {/* Table Body, map through the fetched data to format & display them inside the table cells */}            
          <TableBody>
            {newsletters.data.map((newsletter) => (
              <TableRow key={newsletter.id}>
                <TableCell>{newsletter.subject}</TableCell>
                <TableCell>{newsletter.sentCount}</TableCell>
                <TableCell>{formatDateTime(newsletter.sentAt || newsletter.createdAt).dateTime}</TableCell>
                <TableCell>                    
                  <DeleteDialog id={newsletter.id} action={deleteNewsletter} />       {/* Delete modal component */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination, if the total number of pages is greater than 1, show the pagination component */}    
        {newsletters.totalPages > 1 && (<Pagination page={Number(searchParams.page) || 1} totalPages={newsletters.totalPages} />)}
      </div>
    </div>
  )
}

export default NewsletterHistoryPage