import { Card, CardContent } from '@/components/ui/card';
import { getTranslations } from 'next-intl/server'
import { DollarSign, Headset, ShoppingBag, WalletCards } from 'lucide-react';

// Static component, displays a set of icon boxes with info about services or features offered by the website.
const IconBoxes = async () => {
  const t = await getTranslations('Home');               // get translation function for (Home)
  return (
    <div>
      <Card className='my-20'>
        <CardContent className='grid gap-4 md:grid-cols-4 p-4 '>
          <div className='space-y-2 ltr:border-r-2 ltr:border-r-slate-200 rtl:border-l-2 rtl:border-l-slate-200 '>
            <ShoppingBag />
            <div className='text-sm font-bold'>{t('free-shipping')}</div>
            <div className='text-sm text-muted-foreground'> {t('free-shipping-desc')} </div>            
          </div>
          <div className='space-y-2 ltr:border-r-2 ltr:border-r-slate-200 rtl:border-l-2 rtl:border-l-slate-200'>
            <DollarSign />
            <div className='text-sm font-bold'>{t('money-back')}</div>
            <div className='text-sm text-muted-foreground'> {t('money-back-desc')} </div>
          </div>
          <div className='space-y-2 ltr:border-r-2 ltr:border-r-slate-200 rtl:border-l-2 rtl:border-l-slate-200'>
            <WalletCards />
            <div className='text-sm font-bold'>{t('flexible-payment')}</div>
            <div className='text-sm text-muted-foreground'> {t('flexible-payment-desc')} </div>
          </div>
          <div className='space-y-2'>
            <Headset />
            <div className='text-sm font-bold'>{t('support')}</div>
            <div className='text-sm text-muted-foreground'> {t('support-desc')} </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default IconBoxes;