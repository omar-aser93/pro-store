import Link from 'next/link';
import ProductList from '@/components/shared/product/product-list';
import ProductCarousel from '@/components/shared/product/product-carousel';
import { getDeal, getFeaturedProducts, getLatestProducts } from '@/lib/actions/product.actions';
import { getTranslations } from 'next-intl/server'
import IconBoxes from '@/components/icon-boxes';
import DealCountdown from '@/components/deal-countdown';
import SubscribeForm  from '@/components/subscribe-form';
import AnimationTransition from "@/components/AnimationTransition";  

// Home Page, displays featured products carousel, latest products list & ....
const HomePage = async () => {

  const featuredProducts = await getFeaturedProducts();   //Fetch featured products using getFeaturedProducts() server_action
  const latestProducts = await getLatestProducts();       //Fetch latest products using getLatestProducts() server_action
  const deal = await getDeal();                           //Fetch deal of the month using getDeal() server_action
  const t = await getTranslations('Home')                 //get translation function for (Home) 
  return (
    <div className='space-y-8 '>     
      {featuredProducts.length > 0 && <ProductCarousel data={featuredProducts} />}     {/* FeaturedProducts Carousel */}
      <ProductList title={t('newest-arrivals')} data={latestProducts} limit={4}/>      {/* Latest products list */}
      {/* Link to All Products (filtering) page */}
      <div className='flex justify-center items-center my-8'>
        <Link href='/search' className='px-8 py-4 text-md font-semibold rounded-md bg-slate-950 text-white hover:opacity-80' > {t('products-link')} </Link>        
      </div>
      <AnimationTransition><IconBoxes /></AnimationTransition>       {/* Icon boxes component wrapped with animation component */}
      <SubscribeForm />                                              {/* Subscribe form component */}
      {deal && <DealCountdown data={deal}/>}                         {/* Deal countdown component */}
    </div>
  );
};

export default HomePage;