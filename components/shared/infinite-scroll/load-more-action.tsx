'use server';

import { getAllProducts } from '@/lib/actions/product.actions';
import ProductCard from '@/components/shared/product/product-card';

// a server-side helper function inside a server component to (Load more products cards based on filters)
// Not a regular server action, because it is (Pre-rendering a UI), returning a React component (ProductCard) instead of JSON data.
export async function loadMore({ query, category, price, rating, sort, page }: 
      { query?: string; category?: string; price?: string; rating?: string; sort?: string; page: number;}) {

  // getAllProducts() server-action, to Fetch products based on filters & page number      
  const products = await getAllProducts({ query: query || '', category: category || '', price: price || '', rating: rating || '', sort: sort || '', page });

  /* Return an object {key: data, value: map through fetched products & pass each product as a param to server-component ProductCard} , 
     and {totalPages: products.totalPages} as the 2nd item in the object. */
  return {
    data: products.data.map((product) => (
     <div className='flex flex-col justify-center items-center mb-3' key={product.id}> 
       <ProductCard key={product.id} product={product} /> 
     </div>
    )),
    totalPages: products.totalPages  
  };
}
