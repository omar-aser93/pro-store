import { auth } from '@/auth';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';         //redirect similar to useRouter().push() but preferred for server-components
import { shippingAddressType } from '@/lib/validator';
import ShippingAddressForm from './shipping-address-form';

//set page title to "Shipping Address"
export const metadata: Metadata = {
  title: 'Shipping Address',
};


//Shipping Address Page, will display the shipping address form component after we pass the user's address as a prop
const ShippingAddressPage = async () => {
  
  //Fetch the current user's session (NextAuth), redirect unauthenticated users to the sign-in page
  const session = await auth();    
  if (!session) { redirect('/sign-in'); }

  const cart = await getMyCart();                             //Fetch user's cart using getMyCart() server-action
  if (!cart || cart.items.length === 0) redirect('/cart');    //If cart is empty, redirect to the cart page
  
  //get current user ID .. if not found, throw an error
  const userId = session?.user?.id;  
  if (!userId) throw new Error('No user ID');   

  //Fetch user by ID using getUserById() server-action, to get user's extra data not in NextAuth session (ex: address object)
  const user = await getUserById(userId);    

  return <><ShippingAddressForm address={user.address as shippingAddressType} /></>;
};

export default ShippingAddressPage;