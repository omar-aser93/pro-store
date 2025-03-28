import ProductCard from './product-card';
import { Product } from '@/lib/validator';      //import the Product type from the z validator file


//Component to display a list of products
const ProductList = ({ data, title, limit }: { data: Product[]; title?: string; limit?: number; }) => {    
   
  const limitedData = limit ? data.slice(0, limit) : data;      // Apply limit if provided, otherwise show all products
  
    return (
      <div className='my-10'>
        <h2 className='h2-bold mb-4'>{title}</h2>
        {/*Display a grid of product cards by mapping through products/limited_products, then pass data to a product card component */}
        {limitedData.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {limitedData.map((product: Product) => (
               <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div><p>No products found</p></div>     // Show this message if no products found
        )}
      </div>
    );
  };
  
export default ProductList;