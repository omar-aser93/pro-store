import { cn } from '@/lib/utils';          //shadcn `cn` utility function, used to combine classNames dynamically.

//This component takes in the price as a number and converts it to a string. then splits the string into integer and decimal parts. then displays the integer part with a `$` sign and the decimal part with a `.` in between.
const ProductPrice = ({ value, className }: { value: number; className?: string; }) => {  
    
  const stringValue = value.toFixed(2);                            // Ensures two decimal places 
  const [intValue, floatValue] = stringValue.split('.');           // Separate integer and decimal parts

  return (
    //optional `className` prop, can be used to add additional classes to the component. The `cn` function will combine the classNames & add the `text-2xl` class.
    <p className={cn('text-2xl', className)}>
      <span className='text-xs align-super'>$</span>
      {intValue}
      <span className='text-xs align-super'>.{floatValue}</span>
    </p>
  );
};

export default ProductPrice;