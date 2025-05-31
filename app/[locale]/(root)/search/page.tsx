import Pagination from '@/components/shared/pagination';
import LoadMoreComponent from '@/components/shared/infinite-scroll/load-more-component';
import ProductCard from '@/components/shared/product/product-card';
import { getAllCategories, getAllProducts } from '@/lib/actions/product.actions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';


//Dynamic Meta Data using generateMetadata() from Nextjs
export async function generateMetadata(props: { searchParams: Promise<{q: string; category: string; price: string;  rating: string; }> }) {
  //get & destructure search params from the URL & assign default values
  const { q= 'all', category= 'all', price= 'all', rating= 'all' } = await props.searchParams;             
  //check & define if the filters are not `all` & not empty. 
  const isQuerySet = q && q !== 'all' && q.trim() !== '';
  const isCategorySet = category && category !== 'all' && category.trim() !== '';
  const isPriceSet = price && price !== 'all' && price.trim() !== '';
  const isRatingSet = rating && rating !== 'all' && rating.trim() !== '';
  //return the title based on the filters values if params are not empty or `all`  
  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return { title: `Search ${isQuerySet ? q : ''} ${isCategorySet ? `: Category ${category}` : ''} ${isPriceSet ? `: Price ${price}` : ''} ${isRatingSet ? `: Rating ${rating}` : ''}` };
  } else {
    return { title: 'Search Products' };       //if no filters, return the default title as `Search Products`.
  }
}


// Search Page (we redirected to it from the header search bar), it displays filtered products with pagination
const SearchPage = async (props: { searchParams: Promise<{ q?: string; category?: string; price?: string; rating?: string; sort?: string; page?: string; }> }) => {
  
  //get & destructure search params from the URL & assign default values
  const { q= 'all', category= 'all', price= 'all', rating= 'all', sort= 'newest', page= '1' } = await props.searchParams;             
                    
  // Array of Price ranges options & Array of Ratings options & Array of Sorting options
  const prices = [{ name: '$1 to $50', value: '1-50'}, { name: '$51 to $100', value: '51-100' }, { name: '$101 to $200', value: '101-200' }, { name: '$201 to $500', value: '201-500' }, { name: '$501 to $1000', value: '501-1000' }];
  const ratings = [4, 3, 2, 1]; 
  const sortOrders = ['newest', 'lowest', 'highest', 'rating'];

  // Get All products server-action, receives the filters + limit & page values for pagination
  const products = await getAllProducts({ category, query: q, price, rating, page: Number(page), sort });
  const categories = await getAllCategories();             // Get All products_categories server-action

  return (    
    <div className='grid md:grid-cols-5 md:gap-5'>

      {/* Side Filter */}      
      <div className='filter-links'>
        {/* Category Links */}
        <div className='text-xl mt-3 mb-2'>Department</div>       
        <ul className='space-y-1 flex md:flex-col flex-row justify-center items-center md:items-start flex-wrap gap-6 md:gap-2'>
          {/* Any category Link (no filter) */}  
          <li>
            <Link href={`/search?${new URLSearchParams({ q, category: 'all', price, rating, sort, page}).toString()}`} className={`${ ('all' === category || '' === category) && 'font-bold' }`}>Any</Link>
          </li>
          {/* Map through fetched categories & pass each category as a param to the filter Link */}
          {categories.map((x) => (
          <li key={x.category}>
            <Link href={`/search?${new URLSearchParams({ q, category: x.category, price, rating, sort, page }).toString()}`} className={`${x.category === category && 'font-bold'}`}>{x.category}</Link>
          </li>
          ))}
        </ul>      
          
        {/* Price Links */}        
        <div className='text-xl mt-8 mb-2'>Price</div>
        <ul className='space-y-1 flex md:flex-col flex-row justify-center items-center md:items-start flex-wrap gap-6 md:gap-0'>
          {/* Any price Link (no filter) */}
          <li>
            <Link href={`/search?${new URLSearchParams({ q, category, price: 'all', rating, sort, page }).toString()}`} className={`${'all' === price && 'font-bold'}`}>Any</Link>
          </li>  
          {/* Map through price ranges array & pass each price range as a param to the filter Link */}  
          {prices.map((p) => (
          <li key={p.value}>
            <Link href={`/search?${new URLSearchParams({ q, category, price: p.value, rating, sort, page }).toString()}`} className={`${p.value === price && 'font-bold'}`}>{p.name}</Link>
          </li>      
          ))}
        </ul>
            
        {/* Rating Links */}
        <div className='text-xl mt-8 mb-2'>Customer Review</div>
        <ul className='space-y-1 flex md:flex-col flex-row justify-center items-center md:items-start flex-wrap gap-6 md:gap-0'>
          {/* Any rating Link (no filter) */}  
          <li>
            <Link href={`/search?${new URLSearchParams({ q, category, price, rating: 'all', sort, page }).toString()}`} className={`${'all' === rating && 'font-bold'}`}>Any</Link>
          </li>
          {/* Map through ratings array & pass each rating as a param to the filter Link */}
          {ratings.map((r) => (
          <li key={r}>
            <Link href={`/search?${new URLSearchParams({ q, category, price, rating: r.toString(), sort, page }).toString()}`} className={`${r.toString() === rating && 'font-bold'}`}>{`${r} stars & up`}</Link>
          </li>
          ))}  
        </ul>
      </div>
      
      <div className='md:col-span-4 space-y-4'>
        <div className='flex-between flex-col md:flex-row my-8 '>
          {/* check if the filters is not `all` & not empty. If it is not, we are showing the filter text & a Clear button */}
          <div className='flex items-center'>
            {q !== 'all' && q !== '' && ` Query: ${q},`} {category !== 'all' && category !== '' && ` Category: ${category}, `} {price !== 'all' && ` Price: ${price}, `} {rating !== 'all' && ` Rating: ${rating} `} 
            &nbsp; {(q !== 'all' && q !== '') || (category !== 'all' && category !== '') || rating !== 'all' || price !== 'all' ? (<Button variant={'outline'} asChild><Link href='/search'><span>X</span> Clear</Link></Button> ) : null}
          </div>          
          {/* Sorting, Map through sortOrders array & pass each sort order as a param to the filter Link */}
          <div > 
            Sort by {sortOrders.map((s) => (
            <Link key={s} href={`/search?${new URLSearchParams({ q, category, price, rating, sort: s, page }).toString()}`} className={`mx-2 ${sort == s && 'font-bold'} `} >
              {s}
            </Link>
            ))}
          </div>
        </div>


        {/* Desktop: Regular grid with pagination */}
        <div className='hidden md:block'> 
          <div className='gap-4 grid lg:grid-cols-3 md:grid-cols-2 '> 
            {/* Search results, if no products, display a message... else, Map through filtered products & pass data to ProductCard component */}        
            {products!.data.length === 0 && <div>No product found</div>}
            {products!.data.map((product) => (<ProductCard key={product.id} product={product} />))}
          </div>
           {/* Pagination, only show if there is more than one page */}
           {products!.totalPages! > 1 && (<Pagination page={page} totalPages={products!.totalPages} />)}
        </div>

        {/* Mobile: Infinite scroll */}
        <div className="md:hidden">
          {products.data.length === 0 ? (<p>No products found</p>) : (
            <>
              {/* intial 1st page displayed by default */}
              <div className="flex flex-col justify-center items-center gap-3 mb-3">
                {products.data.map((product) => (<ProductCard key={product.id} product={product} />))}
              </div>
              
              {/* Show LoadMore component as long as we are not on the last page */}
              {Number(page) < products.totalPages && (
                <LoadMoreComponent query={q} category={category} price={price} rating={rating} sort={sort} initialPage={Number(page) + 1} totalPages={products.totalPages} />
              )}
            </>
          )}
        </div>
       
    </div>
  </div>    
  );
};
  
export default SearchPage;