import { notFound } from 'next/navigation';      //get not-found.tsx we created, from next/navigation (to use it manually)
import ProductPrice from '@/components/shared/product/product-price';
import { getProductBySlug } from '@/lib/actions/product.actions';
import ProductImages from '@/components/shared/product/product-images';
import AddToCart from '@/components/shared/product/add-to-cart';
import { getMyCart } from '@/lib/actions/cart.actions';
//shadcn components
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';


// Product Details Page , we set the [slug] url params TS type (Promise<{ slug: string }>)
const ProductDetailsPage = async (props: { params: Promise<{ slug: string }> }) => {
  
  const { slug } = await props.params;                //get the slug from the url params
  const product = await getProductBySlug(slug);       //pass product slug to getProductBySlug() server-action
  if (!product) notFound();                           //if product not found, return the not-found.tsx page we created

  const cart = await getMyCart();                     //get user's cart using getMyCart() server-action
  return (
    <>
      <section>
        {/* grid of 5 cols .. images col will span to 2 & details col will span to 2 & action col will be 1 col */}
        <div className='grid grid-cols-1 md:grid-cols-5'>
          {/* productImages component */}
          <div className='col-span-2'><ProductImages images={product.images!} /></div>

          {/* Details Column */}
         <div className='col-span-2 p-5'>
            <div className='flex flex-col gap-6'>
              <p>
                {product.brand} {product.category}
              </p>
              <h1 className='h3-bold'>{product.name}</h1>
              <p>
                {product.rating} of {product.numReviews} reviews
              </p>
              {/* ProductPrice component */}
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                <ProductPrice value={Number(product.price)} className='w-24 rounded-full bg-green-100 text-green-700 px-5 py-2' />
              </div>
            </div>
            <div className='mt-10'>
              <p>Description:</p>
              <p>{product.description}</p>
            </div>
          </div>

          {/* Action Card */}
          <div>
            <Card>
              <CardContent className='p-4'>
                {/* ProductPrice component */}
                <div className='mb-2 flex justify-between'>
                  <div>Price</div>
                  <div><ProductPrice value={Number(product.price)} /></div>
                </div>
                {/* check if product is in stock, show it in shadcn badge */}
                <div className='mb-2 flex justify-between'>
                  <div>Status</div>
                  {product.stock > 0 ? (<Badge variant='outline'>In stock</Badge>) : (<Badge variant='destructive'>Unavailable</Badge>)}
                </div>
                {/*if product is in stock, show Add_to_cart component & pass product details as props */}
                {product.stock > 0 &&(<div className=' flex-center'>
                   <AddToCart cart={cart} item={{ productId: product.id, name: product.name, slug: product.slug, price: product.price, qty: 1, image: product.images![0] }} />
                </div>)}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailsPage;