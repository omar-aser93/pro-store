'use client';

import { useState } from 'react';
import ProductImages from '@/components/shared/product/product-images';
import AddToCart from '@/components/shared/product/add-to-cart';
import ProductPrice from '@/components/shared/product/product-price';
import ToggleWishButton from '@/components/shared/product/toggle-wish-button';
import Rating from '@/components/shared/product/rating';
import ShareButton from '@/components/shared/product/share-button';
import ShowMoreText from '@/components/ShowMoreText';
import { Product, Cart } from '@/lib/validator';
//shadcn components
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';



// product-details client component separated from the product-details page (server component), to allow usage of client-side hooks
export default function ProductDetailsComponent({ product, cart, isFavorited }: { product: Product; cart: Cart; isFavorited: boolean; }) {
  
  // States to store the selected color & size
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // variable to store the product images to be displayed, either from color based images or default product images 
  const selectedImages = selectedColor ? (product.colors.find((color) => color.name === selectedColor)?.images ?? product.images) : product.images;

  return (    
    // grid of 5 cols .. images col will span to 2 & details col will span to 2 & action buttons col will be 1 col */}
    <div className='grid grid-cols-1 md:grid-cols-5'>
      
      {/* product-Images component & color/size selectors */}
      <div className='col-span-2 flex flex-col gap-4'>
        <ProductImages images={selectedImages} />
        {product.colors.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label className="font-medium"> Available Colors </Label>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((color) =>  (
                <button key={color.name} type="button" title={color.name} aria-label={`Select color ${color.name}`}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center ${selectedColor === color.name ? 'ring-2 ring-offset-2 ring-orange-400' : ''}`}
                  onClick={() => { setSelectedColor(color.name);
                    // auto-pick first in-stock size if needed
                    const firstAvailable = color.sizes?.find((s) => s.stock > 0);
                    setSelectedSize(firstAvailable ? firstAvailable.size : null);
                  }}   
                >
                  <span style={{ backgroundColor: color.name }} className="block w-8 h-8 rounded-full" />                 
                </button>
              ))} 
              {/* "No color" button */}
              <button type="button" title="No color variant" onClick={() => { setSelectedColor(null); setSelectedSize(null); }} className="px-3 py-1 border rounded-md text-sm" >      
                No color
              </button>
            </div>
          </div>
        )}              
        {/* Size Selector (only shown when a color is selected) & only show the sizes available for this color */}
        {selectedColor && (product.colors.find((color) => color.name === selectedColor)?.sizes?.length ?? 0) > 0 && (
          <div className="flex flex-col gap-2">
            <Label className="font-medium"> Select a Size </Label>
            <Select value={selectedSize || ''} onValueChange={setSelectedSize}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a size" />
              </SelectTrigger>
              <SelectContent>
                {product.colors.find((color) => color.name === selectedColor)?.sizes.map((sizeObj) => (
                  <SelectItem key={sizeObj.size} value={sizeObj.size} disabled={sizeObj.stock === 0} >
                    {sizeObj.size} {sizeObj.stock === 0 ? '(Out of stock)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Details Column */}
      <div className='col-span-2 p-5'>
        <div className='flex flex-col gap-6'>
          <p>{product.brand} {product.category}</p>
          {/* Name & wishlist button */}
          <div className='flex items-center gap-3'>
            <h1 className='h3-bold'>{product.name}</h1> 
            <ToggleWishButton productId={product.id} isFavorited={isFavorited} /> 
          </div>
          {/* ProductRating component */}
          <div> <Rating value={Number(product.rating)} /> <p>{product.numReviews} reviews</p> </div>
          {/* ProductPrice component */}
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
            <ProductPrice value={Number(product.price)} className='w-24 rounded-full bg-green-100 text-green-700 px-5 py-2' />
          </div>
          {/* ShareButton component */}
          <ShareButton shareUrl={`${process.env.NEXT_PUBLIC_SERVER_URL}product/${product.slug}`} title={product.name}/> 
        </div>
        {/* Description, using ShowMoreText component */}
        <div className="mt-10">
          <p className="font-medium">Description:</p>
          <ShowMoreText text={product.description} maxLength={200} className="pt-2" />
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
            {/*if product is in stock, show Add_to_cart component, pass cart & product details as props */}
            {product.stock > 0 &&(
              <div className=' flex-center'>
                <AddToCart cart={cart} item={{ productId: product.id, name: product.name, slug: product.slug, price: product.price, qty: 1, image: selectedImages?.[0], color: selectedColor, size: selectedSize }} />
              </div>)}
          </CardContent>
        </Card>
      </div>
    </div>    
  );
}
