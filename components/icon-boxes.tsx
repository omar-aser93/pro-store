import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Headset, ShoppingBag, WalletCards } from 'lucide-react';

// Static component, displays a set of icon boxes with info about services or features offered by the website.
const IconBoxes = () => {
  return (
    <div>
      <Card className='my-20'>
        <CardContent className='grid gap-4 md:grid-cols-4 p-4 '>
          <div className='space-y-2 ltr:border-r-2 ltr:border-r-slate-200 rtl:border-l-2 rtl:border-l-slate-200 '>
            <ShoppingBag />
            <div className='text-sm font-bold'>Free Shipping</div>
            <div className='text-sm text-muted-foreground'> Free shipping for order above $100 </div>            
          </div>
          <div className='space-y-2 ltr:border-r-2 ltr:border-r-slate-200 rtl:border-l-2 rtl:border-l-slate-200'>
            <DollarSign />
            <div className='text-sm font-bold'>Money Back Guarantee</div>
            <div className='text-sm text-muted-foreground'> Within 30 days for an exchange </div>
          </div>
          <div className='space-y-2 ltr:border-r-2 ltr:border-r-slate-200 rtl:border-l-2 rtl:border-l-slate-200'>
            <WalletCards />
            <div className='text-sm font-bold'>Flexible Payment</div>
            <div className='text-sm text-muted-foreground'> Pay with credit card, PayPal or COD </div>
          </div>
          <div className='space-y-2'>
            <Headset />
            <div className='text-sm font-bold'>24/7 Support</div>
            <div className='text-sm text-muted-foreground'> Get support at any time </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default IconBoxes;