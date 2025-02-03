import ProductList from '@/components/shared/product/product-list';
import { getLatestProducts } from '@/lib/actions/product.actions';

const HomePage = async () => {

  const latestProducts = await getLatestProducts();     //Fetch latest products using getLatestProducts() server_action
  return (
    <div className='space-y-8'>
      {/* Display the latest products, by passing them to the ProductList component as props */}
      <h2 className='h2-bold'>Latest Products</h2>
      <ProductList title='Newest Arrivals' data={latestProducts} limit={4}/>      
    </div>
  );
};
export default HomePage;