import { getWishlist } from '@/lib/actions/wishlist.actions';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';        //shadcn card component
import { auth } from '@/auth';
import ToggleWishButton from '@/components/shared/product/toggle-wish-button';
import ProductPrice from '@/components/shared/product/product-price';
import ClearWishList from './clear-list-buttom';

//set page title to "Wishlist"
export const metadata = {
    title: 'Wishlist',
};


export default async function WishlistPage() {
  // Get the current user's ID from the session, if not authenticated, return `You must be logged` message
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) { return <div className="text-center py-20 text-xl">You must be <Link href="/login" className="text-gray-600 hover:underline">logged in</Link> to view your wishlist.</div>; }

  const wishlist = await getWishlist();               // Fetch the current user's wishlist items server-action
  // Check if the res is an array of wishlist items & not empty , if not, return `Your wishlist is empty` message
  if (!Array.isArray(wishlist) || wishlist.length === 0) {
    return <div className="text-center py-20 text-xl">Your wishlist is empty.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Page title & Clear wishlist component*/}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Your Wishlist</h1>
        <ClearWishList />              
      </div>      
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {/* Map through the wishlist items and display them in a grid layout */}
        {wishlist.map(({ id, product }) => (
          <Card key={id} className="relative group">
            <CardContent className="p-4 space-y-2">
              <div className="w-full h-40 relative mb-2">
                <Image src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} fill className="object-cover rounded-lg" />
              </div>
              <div className="text-sm text-gray-500">{product.brand}</div>
              <div className="flex items-center justify-between">
                <Link href={`/product/${product.slug}`} className="font-medium text-base hover:underline"> {product.name} </Link>
                <ToggleWishButton productId={product.id} isFavorited={true} />
              </div>
              <div className="text-sm font-semibold text-primary">
                <ProductPrice value={Number(product.price)} />      {/* Pass price as a number to the product price component*/}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
