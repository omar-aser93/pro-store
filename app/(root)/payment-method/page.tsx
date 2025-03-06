import { Metadata } from 'next';
import { auth } from '@/auth';
import { getUserById } from '@/lib/actions/user.actions';
import PaymentMethodForm from './payment-method-form';

//set page title to "Shipping Address"
export const metadata: Metadata = {
  title: 'Payment Method',
};


//payment method page, will display the payment method form component after we pass the user's pay-method as a prop
const PaymentMethodPage = async () => {
 
  //Fetch the current user's session (NextAuth) to get the user ID .. if not found, throw an error
  const session = await auth();      
  const userId = session?.user?.id;  
  if (!userId) throw new Error('No user ID');   

  //Fetch user by ID using getUserById() server-action, to get user's extra data not in NextAuth session (ex: address object)
  const user = await getUserById(userId);  

  return <><PaymentMethodForm preferredPaymentMethod={user.paymentMethod} /></>;    
};

export default PaymentMethodPage;