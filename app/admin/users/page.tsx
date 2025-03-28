import { Metadata } from 'next';
import { getAllUsers, deleteUser } from '@/lib/actions/user.actions';
import Link from 'next/link';
import Pagination from '@/components/shared/pagination';
import DeleteDialog from '@/components/shared/delete-dialog';
import { formatId } from '@/lib/utils';
//shadcn components
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

//set page title to "All Users"
export const metadata: Metadata = {
  title: 'All Users',
};


//Users page, to display All users (with pagination & search filter) .. props: { searchParams: Promise<{}> } is how to get searchParams in server-component
const UsersPage = async (props: {searchParams: Promise<{ query: string; page: string; }> }) => {
  
  const searchParams = await props.searchParams;           //get All URL searchParams
  //pass (query,page number) to getAllUsers() server-action & set default values, also we can pass limit (items per page) if we want 
  const users = await getAllUsers({ query: searchParams.query || '' , page: Number(searchParams.page) || 1, });
  
  return (
    <div className='space-y-2'>
      {/* Header title + a Display/Remove Search Filter */}
      <div className='flex items-center gap-3'>
        <h1 className='h2-bold'>Users</h1>
        {searchParams.query && (
        <div> Filtered by <i>&quot;{searchParams.query}&quot;</i>{' '}
          <Link href={`/admin/users`}><Button variant='outline' size='sm'> <span>X</span> Remove Filter </Button></Link>
        </div> )}
      </div>

      <div className='overflow-x-auto'>
        <Table>
          {/* Table Header */}
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>EMAIL</TableHead>
              <TableHead>ROLE</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          {/* Table Body, map through the fetched data to format & display them inside the table cells */}
          <TableBody>
            {users.data.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{formatId(user.id)}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell className='flex gap-1'>
                  <Button variant='outline' size='sm'>
                    <Link href={`/admin/users/${user.id}`}>Edit</Link>       {/* Edit user Link */}
                  </Button>
                  <DeleteDialog id={user.id} action={deleteUser} />          {/* Delete modal component */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination, if total pages are more than 1 */}
        {users?.totalPages && users.totalPages > 1 && (<Pagination page={searchParams.page} totalPages={users.totalPages} />)}
      </div>
    </div>
  )
}

export default UsersPage