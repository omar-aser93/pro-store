import { Metadata } from 'next';
import NewsletterForm from '@/components/shared/admin/newsletter-form';

//set page title to "Create Newsletter"
export const metadata: Metadata = {
  title: 'Create Newsletter',
};


const CreateNewsletterpage = () => {
  return (
    <>
    <h2 className='h2-bold'>Create Newsletter</h2>      
    <div className='my-8'><NewsletterForm /></div>       {/* NewsletterForm component to create new newslettter */}
  </>
  )
}

export default CreateNewsletterpage