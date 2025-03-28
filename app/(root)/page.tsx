import ProductList from '@/components/shared/product/product-list';
import ProductCarousel from '@/components/shared/product/product-carousel';
import { getFeaturedProducts, getLatestProducts } from '@/lib/actions/product.actions';
import Link from 'next/link';


// Home Page, displays featured products carousel, latest products list & ....
const HomePage = async () => {

  const featuredProducts = await getFeaturedProducts();   //Fetch featured products using getFeaturedProducts() server_action
  const latestProducts = await getLatestProducts();       //Fetch latest products using getLatestProducts() server_action
  return (
    <div className='space-y-8'>     
      {featuredProducts.length > 0 && <ProductCarousel data={featuredProducts} />}     {/* FeaturedProducts Carousel */}
      <ProductList title='Newest Arrivals' data={latestProducts} limit={4}/>           {/* Latest products list */}
      {/* Link to All Products (filtering) page */}
      <div className='flex justify-center items-center my-8'>
        <Link href='/search' className='px-8 py-4 text-lg font-semibold rounded-md bg-slate-950 text-white hover:opacity-80' > View All Products </Link>        
      </div>
    </div>
  );
};
export default HomePage;