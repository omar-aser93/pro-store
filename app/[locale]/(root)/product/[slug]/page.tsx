import { notFound } from 'next/navigation';      //get not-found.tsx we created, from next/navigation (to use it manually)
import { Metadata } from "next";
import { auth } from '@/auth';
import Link from 'next/link';
import { getProductBySlug, getRelatedProducts } from '@/lib/actions/product.actions';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getWishlist } from '@/lib/actions/wishlist.actions';
import { getReviews } from '@/lib/actions/review.actions';
import ProductDetailsComponent from './product-details';
import ReviewList from './review-list';
import ReviewForm from './review-form';
import RelatedProductsCarousel from './related-products-carousel';


// generate dynamic metadata for the page
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  // Fetch the product by slug param... if not found, return metadata with title 'Product Not Found', else return product metadata details + openGraph metadata (for social media sharing)
  const product = await getProductBySlug((await props.params).slug);
  if (!product) return { title: 'Product Not Found' };
  return { title: `${product.name}`, description: product.description, keywords: [product.name, product.brand, product.category], openGraph: { title: product.name, description: product.description, images: [{ url: product.images?.[0] || '' }] }
 };
}


// Product Details Page , we set the [slug] url params TS type (Promise<{ slug: string }>)
const ProductDetailsPage = async (props: { params: Promise<{ slug: string }> }) => {
  
  const { slug } = await props.params;                //get the slug from the url params
  const product = await getProductBySlug(slug);       //pass product slug to getProductBySlug() server-action
  if (!product) notFound();                           //if product not found, return the not-found.tsx page we created
  
  //get current user session to get user id
  const session = await auth();                       
  const userId = session?.user?.id;

  const cart = await getMyCart();                                 //get user's cart using getMyCart() server-action
  const reviews = await getReviews({ productId: product.id });    //get product reviews using getReviews() server-action
  const relatedProducts = await getRelatedProducts(product.id);   // get related products using getRelatedProducts() server-action
  
  const wishList = await getWishlist();           // Fetch the current user's wishlist items server-action
  // Check if the res is an array of wishlist items , if so, check if the current product is in the wishlist
  const isFavorited = Array.isArray(wishList) ? wishList.some((item) => item.productId === product.id) : false;

  return (
    <>
      {/* Product Details component - pass product, cart & isFavorited as props */}
      <section>
        <ProductDetailsComponent product={product} cart={cart!} isFavorited={isFavorited} />
      </section>

      <hr className='my-10' />

      {/* Reviews components */}
      <section className='mt-10'>
        <h2 className='h2-bold  mb-5'>Customer Reviews</h2>
        <div className='space-y-4'>
          {/*if no reviews, show (No reviews) message */}
          {!reviews && <div>No reviews yet</div>}    
          {/*Review Form component, After checking if user is logged in, We use the `callbackUrl` to redirect to the product page after they sign in */} 
          {userId ? ( <ReviewForm userId={userId} productId={product.id} /> ) : (
            <div> Please{' '}<Link className='text-primary px-2' href={`/api/auth/signin?callbackUrl=/product/${product.slug}`} > sign in </Link>{' '} to write a review </div>
          )}  
          {/* ReviewList component, pass userId, productId & productSlug as props */}   
          <ReviewList reviews={reviews.data} userId={userId!} />      
        </div>
      </section>      

      <hr className='my-10' />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-10">
          <h2 className="h2-bold mb-5">Related Products</h2>
          <RelatedProductsCarousel products={relatedProducts} />
        </section>
      )}
    </>
  );
};

export default ProductDetailsPage;