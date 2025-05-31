'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/validator';
import { useLocale } from 'next-intl';                      //next-intl hook to get current locale (in client components)
//shadCN carousel components
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';


//Carousel component, displays Banner images of the featured products (used in Home page)
function ProductCarousel({ data }: { data: Product[] }) {
  const locale = useLocale();               //get the current locale (language)
  return (        
    <Carousel className='w-full mb-12' opts={{ loop: true, direction: locale ==='ar' ? 'rtl' : 'ltr' }} plugins={[ Autoplay({ delay: 2000, stopOnInteraction: true, stopOnMouseEnter: true }) ]} >
      <CarouselContent>
        <CarouselItem>
          <Link href='/search' className='relative mx-auto'>
            <Image alt='All Products' src='/images/banner-0.jpg' width='0' height='0' sizes='100vw' className='w-full h-auto rounded-md' />
          </Link>
        </CarouselItem>
        {/* Map through the received products and display their Banners & Name in a Carousel Item */}
        {data.map((product: Product) => (
          <CarouselItem key={product.id}>
            <Link href={`/product/${product.slug}`}>
              <div className='relative mx-auto '>
                <Image alt={product.name} src={product.banner!} width='0' height='0' sizes='100vw' className='w-full h-auto rounded-md' />
                <div className='absolute inset-0 flex items-end justify-center'>
                  <h2 className=' bg-gray-900 bg-opacity-50 text-2xl font-bold px-2 text-white'> {product.name} </h2>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 lg:-left-10"/>   {/* Prev button */}
      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 lg:-right-10"/>     {/* Next button */}
    </Carousel>   
  );
}

export default ProductCarousel; 