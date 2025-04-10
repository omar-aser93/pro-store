import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';         //shadcn card component
import ProductPrice from './product-price';
import ToggleWishButton from './toggle-wish-button';
import Rating from './rating';
import { Product } from '@/lib/validator';      //import the Product type from the z validator file
import { getWishlist } from '@/lib/actions/wishlist.actions';

//Product card component, receives a product as a prop
const ProductCard = async ({ product }: { product: Product }) => {

  const wishList = await getWishlist();           // Fetch the current user's wishlist items server-action
  // Check if the res is an array of wishlist items , if so, check if the current product is in the wishlist
  const isFavorited = Array.isArray(wishList) ? wishList.some((item) => item.productId === product.id) : false; 
  return (
    <Card className='w-full max-w-sm'>
      {/* Card header, contains Image linked to the product page */}
      <CardHeader className='p-0 items-center'>        
        <Link href={`/product/${product.slug}`}>
          <Image priority={true} src={product.images![0]} alt={product.name} className='aspect-square object-cover rounded' height={300} width={300} />
        </Link>
      </CardHeader>
      {/* Card content, contains Product details ... name, brand, price, rating */}
      <CardContent className='p-4 grid gap-4'>          
          <div className='text-xs'>{product.brand}</div>
          <div className='flex items-center justify-between'> 
            <Link href={`/product/${product.slug}`}>
              <h2 className='text-sm font-medium'>{product.name}</h2>
            </Link>         
            <ToggleWishButton productId={product.id} isFavorited={isFavorited} />   {/* Wishlist button component */}
          </div>
        <div className='flex-between gap-4'>
          <Rating value={Number(product.rating)} />              {/* Pass rating as a number to the RATING component*/}
          {product.stock > 0 ? (
            <ProductPrice value={Number(product.price)} />       // Pass price as a number to the product price component
          ) : (
            <p className='text-destructive'>Out of Stock</p>     // Show this message if product is out of stock
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;