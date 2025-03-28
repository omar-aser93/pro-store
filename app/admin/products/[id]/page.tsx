import { Metadata } from 'next';
import { notFound } from 'next/navigation';     //get not-found.tsx we created, from next/navigation (to use it manually)
import ProductForm from '@/components/shared/admin/product-form';
import { getProductById } from '@/lib/actions/product.actions';

//set page title to "Update product"
export const metadata: Metadata = {
  title: 'Update product',
};


const UpdateProductPage = async (props: { params: Promise<{ id: string; }> }) => {
  
  const { id } = await props.params;            //get product id from the url params
  //get the product by id server-action, if not found, return notFound page
  const product = await getProductById(id);
  if (!product) return notFound();

  return (
    <div className='space-y-8 max-w-5xl mx-auto'>
      <h1 className='h2-bold'>Update Product</h1>
      <ProductForm type='Update' product={product} productId={product.id} />     {/* ProductForm component to update product */}
    </div>
  );
};

export default UpdateProductPage;