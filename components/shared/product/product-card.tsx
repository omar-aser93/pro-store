import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';         //shadcn card component
import ProductPrice from './product-price';
import { Product } from '@/lib/validator';      //import the Product type from the z validator file

const ProductCard = ({ product }: { product: Product }) => {
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
          <Link href={`/product/${product.slug}`}>
            <h2 className='text-sm font-medium'>{product.name}</h2>
          </Link>
        <div className='flex-between gap-4'>
          <p>{product.rating} stars</p>
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