import Link from 'next/link';
import Pagination from '@/components/shared/pagination';
import DeleteDialog from '@/components/shared/delete-dialog';
import DealEditor from '@/components/shared/admin/deal-form';
import BulkForm from '@/components/shared/admin/bulk-form';
import { formatCurrency, formatId } from '@/lib/utils';
import { ArrowUpDown, SquarePen } from 'lucide-react';         //icons library auto installed by shadcn
import { getAllProducts, deleteProduct, bulkDeleteProducts } from '@/lib/actions/product.actions';
import { Metadata } from 'next';
import Image from 'next/image';
//shadcn components
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


//set page title to "All Products"
export const metadata: Metadata = {
  title: 'All Products',
};


//Products page, to display All Products (with pagination & search filter) .. props: { searchParams: Promise<{}> } is how to get searchParams in server-component
const ProductsPage = async (props: {searchParams: Promise<{ query: string; page: string; category: string; sort: string; }> }) => {
  
  const searchParams = await props.searchParams;           //get All URL searchParams
  //pass (query,page number, ...) to getAllProducts() server-action & set default values, also we can pass limit (items per page) if we want 
  const products = await getAllProducts({ query: searchParams.query || '', page: Number(searchParams.page) || 1, category: searchParams.category || '', sort: searchParams.sort || '' });
 
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
          {searchParams.sort && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/products?${new URLSearchParams({ ...searchParams, sort: ""}).toString()}`}><span>X</span> Clear Sort</Link>
          </Button>
          )}
          </div>        
        <div>
        <DealEditor />           {/* DealEditor component to create/update deal of the month */}
        {/* Create Product Link, asChild is used with shadcn components that have button/Link child as trigger */}
        <Button asChild variant='default'>
          <Link href='/admin/products/create'>Create Product</Link>
        </Button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        {/* We wrap the Bulk component around the table (as children) to enable checkboxs selection & deletion, it receives server-action & submitText as prop */}
        <BulkForm action={bulkDeleteProducts} submitText='Delete Selected' key={products?.data.map(p => p.id).join(",")}>
          <Table>
            {/* Table Header, we'll add a link around some of heads to sort by their columns (e.g. price, rating) */}
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 rtl:text-right">Select</TableHead>
                <TableHead className='rtl:text-right'>ID</TableHead>
                <TableHead className='rtl:text-right'>IMAGE</TableHead>
                <TableHead className='rtl:text-right'>NAME</TableHead>
                <TableHead className='rtl:text-right'>
                  <Link href={`/admin/products?${new URLSearchParams({...searchParams, sort: searchParams.sort === "lowest" ? "highest" : "lowest"}).toString()}`}>
                    <span className="flex items-center justify-end gap-1 cursor-pointer" title={ searchParams.sort === "lowest" ? "Sorted by lowest price" : searchParams.sort === "highest" ? "Sorted by highest price" : "Click to sort by price" }> 
                      PRICE <ArrowUpDown className={`h-4 w-4 transition-colors ${ searchParams.sort === "lowest" ? "text-green-500" : searchParams.sort === "highest" ? "text-red-500" : "text-muted-foreground" }`}/> 
                    </span>
                  </Link>
                </TableHead>
                <TableHead className='rtl:text-right'>CATEGORY</TableHead>
                <TableHead className='rtl:text-right'>STOCK</TableHead>
                <TableHead className="rtl:text-right">
                  <Link href={`/admin/products?${new URLSearchParams({ ...searchParams, sort: searchParams.sort === "rating-asc" ? "rating-desc" : "rating-asc"}).toString()}`}>
                    <span className="flex items-center justify-end gap-1 cursor-pointer" title={ searchParams.sort === "rating-asc" ? "Sorted by lowest rating" : searchParams.sort === "rating-desc" ? "Sorted by highest rating" : "Click to sort by rating" }>
                      RATING <ArrowUpDown className={`h-4 w-4 transition-colors ${ searchParams.sort === "rating-asc" ? "text-green-500" : searchParams.sort === "rating-desc" ? "text-red-500" : "text-muted-foreground" }`} />
                    </span>
                  </Link>
                </TableHead>
                <TableHead className='text-center w-[100px]'>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            {/* Table Body, map through the fetched data to format & display them inside the table cells */}
            <TableBody>
              {products?.data.map((product) => (
                <TableRow key={product.id}>
                  <TableCell><input type="checkbox" name="ids" value={product.id} className="cursor-pointer" /></TableCell>
                  <TableCell>{formatId(product.id)}</TableCell>
                  <TableCell>{<Image src={product.images[0]} alt={product.name} width={50} height={50} className='rounded-full border-[rgba(0,0,0,0.3)] border-[1px]' />} </TableCell>
                  <TableCell>{product.name}</TableCell>                
                  <TableCell>{formatCurrency(product.price)}</TableCell>
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
        </BulkForm>

        {/* Pagination, if total pages are more than 1 */}
        {products.totalPages > 1 && (<Pagination page={Number(searchParams.page) || 1} totalPages={products.totalPages} />)}
      </div>
    </div>
  );
};

export default ProductsPage