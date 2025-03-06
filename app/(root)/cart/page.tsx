import CartTable from "./cart-table";
import { getMyCart } from '@/lib/actions/cart.actions';

//set page title to "Shopping Cart"
export const metadata = {
    title: 'Shopping Cart',
  };
  
  
const CartPage = async () => {
  const cart = await getMyCart();      //get user's cart using getMyCart() server-action & pass it to CartTable component

  return( 
  <> <CartTable cart={cart} /> </>
  )
};
  
export default CartPage;