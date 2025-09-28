import ProductCard from '@/components/shared/product/product-card';
import { Product } from '@/lib/validator';
import { getLocale } from 'next-intl/server';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'; // shadcn carousel

// Related Products Carousel component - receives an array of products as props and displays them in a shadcn carousel
export default async function RelatedProductsCarousel({ products }: { products: Product[] }) {
  const locale = await getLocale();         //get the current locale (language) to adjust carousel direction 
  return (
    <Carousel opts={{ align: 'start', loop: false, direction: locale ==='ar' ? 'rtl' : 'ltr' }} className="w-full" >
      <CarouselContent>
        {products.map((product) => (
          <CarouselItem key={product.id} className="mr-3 rtl:mr-0 rtl:ml-3 basis-[42%] md:basis-[29%]" >
            <ProductCard product={product} /> 
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 lg:-left-10"/>   {/* Prev button */}
      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 lg:-right-10"/>     {/* Next button */}
    </Carousel>
  );
}
