import { cn } from '@/lib/utils';            //shadcn `cn` utility function for conditional classes

// CheckoutSteps component (to display the 4 checkout steps) as a header above the forms, receives current step num as a prop
const CheckoutSteps = ({ current = 0 }) => {
  return (
    <div className='flex-between  flex-col md:flex-row  space-x-2 space-y-2 mb-10'>
      {/* create array of the 4 checkout steps, then map through it */}
      {['User Login', 'Shipping Address', 'Payment Method', 'Place Order'].map((step, index) => (          
          <div className='flex items-center justify-center' key={step}>
            {/* change background color, if the received step prop is the current step */}
            <div className={cn( 'p-2 w-56 rounded-full text-center  text-sm', index === current ? 'bg-secondary' : '' )} >
              {step}
            </div>
            {/* add a horizontal line between the steps, except for the last step */}
            {step !== 'Place Order' && ( <hr className='w-16 border-t border-gray-300 mx-2' /> )}
          </div>
        )
      )}
    </div>
  );
};
export default CheckoutSteps;