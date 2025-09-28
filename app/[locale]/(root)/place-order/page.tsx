import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';         //redirect similar to useRouter().push() but preferred for server-components
import { auth } from '@/auth';
import CheckoutSteps from '@/components/shared/checkout-steps';
import PlaceOrderForm from './place-order-form';
import { getMyCart } from '@/lib/actions/cart.actions';
import { getUserById } from '@/lib/actions/user.actions';
import { SquarePen } from 'lucide-react';                            //icons library auto installed by shadcn
import { formatCurrency } from '@/lib/utils';                        //utility function to format currency
import { shippingAddressType } from '@/lib/validator';               //zod schema type for shipping address
//shadcn components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

//set page title to "Place Order"
export const metadata = {
  title: 'Place Order',
};


// Place Order Page, contains cards of user's address, payment method, order items & summary and the submit button component
const placeOrderPage = async () => {
  
  //get current user ID from the session .. if not found, throw an error
  const session = await auth();   
  const userId = session?.user?.id;  
  if (!userId) throw new Error('No user ID');      

  const cart = await getMyCart();            //Fetch the user's cart using getMyCart() server_action
  const user = await getUserById(userId);    //Fetch user by ID using getUserById() server-action, to get user's extra data not in NextAuth session (ex: address object)

  if (!cart || cart.items.length === 0) redirect('/cart');        //If cart is empty, redirect to the cart page
  if (!user.address) redirect('/shipping-address');               //If user has no address, redirect to the shipping address page
  if (!user.paymentMethod) redirect('/payment-method');           //If user has no payment method, redirect to the payment method page

  const userAddress = user.address as shippingAddressType;      //cast user's address to shippingAddressType (to avoid TS error)

  return (
    <>
      {/* CheckoutSteps component, we pass the current step number to change style of the active step title */}
      <CheckoutSteps current={3} />
      <h1 className='py-4 text-2xl'>Place Order</h1>
      {/* grid of 3 cols, span-2 for the cards */}
      <div className='grid md:grid-cols-3 md:gap-5'>
        <div className='overflow-x-auto md:col-span-2 space-y-4'>
          
          {/* Card component with CardContent, we display the user's shipping address */}
          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Shipping Address</h2>
              <p>{userAddress.fullName}</p>
              <p>
                {userAddress.streetAddress}, {userAddress.city},{' '}
                {userAddress.postalCode}, {userAddress.country}{' '}
              </p>
              <div className='mt-3'>
                <Link href='/shipping-address'><Button variant='outline'><SquarePen /> Edit</Button></Link>  {/* link to shipping address page */}
              </div>
            </CardContent>
          </Card>
          
          {/* Card component with CardContent, we display the user's payment method */}
          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Payment Method</h2>
              <p>{user.paymentMethod}</p>
              <div className='mt-3'>
                <Link href='/payment-method'><Button variant='outline'><SquarePen /> Edit</Button></Link>  {/* link to payment method page */}
              </div>
            </CardContent>
          </Card>

          {/* Card component with CardContent, we display a table of the order items */}
          <Card>
            <CardContent className='p-4 gap-4'>
              <h2 className='text-xl pb-4'>Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='rtl:text-right'>Item</TableHead>
                    <TableHead className='rtl:text-right'>Color/Size Options</TableHead>
                    <TableHead className='rtl:text-right'>Quantity</TableHead>
                    <TableHead className='text-right'>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* map through cart items, display image, name, price and qty */}
                  {cart.items.map((item) => (
                    <TableRow key={`${item.slug}-${item.color!}-${item.size!}`}>
                      <TableCell>
                        <Link href={`/product/${item.slug}`} className='flex items-center' >
                          <Image src={item.image} alt={item.name} width={50} height={50} ></Image>
                          <span className='px-2'>{item.name}</span>
                        </Link>
                      </TableCell>
                      {item.color ? <TableCell >
                        <div className='flex items-center gap-3'>
                          <div style={{ backgroundColor: item.color! }} className="w-5 h-5 rounded-full" /> 
                          <div>{item.size}</div>
                        </div>
                      </TableCell> : <TableCell>-</TableCell> }
                      <TableCell> <span className='px-2'>{item.qty}</span> </TableCell>
                      <TableCell className='text-right'> ${item.price} </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Link href='/cart'><Button variant='outline'><SquarePen /> Edit</Button></Link>     {/* link to cart page */}
            </CardContent>
          </Card>
        </div>

        {/* the other grid-col ... a Card component with CardContent, we display the order summary */}
        <div>
          <Card>
            <CardContent className='p-4 gap-4 space-y-4'>
              <div className='flex justify-between'>
                <div>Items</div>
                <div>{formatCurrency(cart.itemsPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Tax</div>
                <div>{formatCurrency(cart.taxPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Shipping</div>
                <div>{formatCurrency(cart.shippingPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Total</div>
                <div>{formatCurrency(cart.totalPrice)}</div>
              </div>
              <PlaceOrderForm />           {/* PlaceOrder Form component */}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default placeOrderPage;