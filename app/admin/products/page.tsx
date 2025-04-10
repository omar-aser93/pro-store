import Link from 'next/link';
import Pagination from '@/components/shared/pagination';
import DeleteDialog from '@/components/shared/delete-dialog';
import { formatCurrency, formatId } from '@/lib/utils';
import { SquarePen } from 'lucide-react';         //icons library auto installed by shadcn
import { getAllProducts, deleteProduct } from '@/lib/actions/product.actions';
import { Metadata } from 'next';
//shadcn components
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';

//set page title to "All Products"
export const metadata: Metadata = {
  title: 'All Products',
};


//Products page, to display All Products (with pagination & search filter) .. props: { searchParams: Promise<{}> } is how to get searchParams in server-component
const ProductsPage = async (props: {searchParams: Promise<{ query: string; page: string; category: string; }> }) => {
  
  const searchParams = await props.searchParams;           //get All URL searchParams
  //pass (query,page number, category) to getAllProducts() server-action & set default values, also we can pass limit (items per page) if we want 
  const products = await getAllProducts({ query: searchParams.query || '', page: Number(searchParams.page) || 1, category: searchParams.category || '' });
 
  return (
    <div className='space-y-2'>
      <div className='flex-between'>
        {/* Header title + a Display/Remove Search Filter */}
        <div className='flex items-center gap-3'>
          <h1 className='h2-bold'>Products</h1>        
          {searchParams.query && (
          <div> Filtered by <i>&quot;{searchParams.query}&quot;</i> {' '} 
            <Link href={`/admin/products`}><Button variant='outline' size='sm'> <span>X</span> Remove Filter </Button></Link>
          </div> )}
        </div>
        {/* Create Product Link, asChild is used with shadcn components that have button/Link child as trigger */}
        <Button asChild variant='default'>
          <Link href='/admin/products/create'>Create Product</Link>
        </Button>
      </div>

      <div className='overflow-x-auto'>
        <Table>
          {/* Table Header */}
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>IMAGE</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead className='text-right'>PRICE</TableHead>
              <TableHead>CATEGORY</TableHead>
              <TableHead>STOCK</TableHead>
              <TableHead>RATING</TableHead>
              <TableHead className='w-[100px]'>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          {/* Table Body, map through the fetched data to format & display them inside the table cells */}
          <TableBody>
            {products?.data.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{formatId(product.id)}</TableCell>
                <TableCell>{<Image src={product.images[0]} alt={product.name} width={50} height={50} className='rounded-full border-[rgba(0,0,0,0.3)] border-[1px]' />} </TableCell>
                <TableCell>{product.name}</TableCell>                
                <TableCell className='text-right'>{formatCurrency(product.price)}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.rating}</TableCell>
                <TableCell className='flex gap-1'>
                  {/* Edit Product Link */}
                  <Button variant='outline' size='sm' >
                    <Link href={`/admin/products/${product.id}`} className='flex items-center justify-between gap-2 mx-2'><SquarePen /> Edit </Link>      
                  </Button>
                  <DeleteDialog id={product.id} action={deleteProduct} />         {/* Delete modal component */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination, if total pages are more than 1 */}
        {products.totalPages > 1 && (<Pagination page={Number(searchParams.page) || 1} totalPages={products.totalPages} />)}
      </div>
    </div>
  );
};

export default ProductsPage