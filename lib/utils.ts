//file that contains utility functions 

// cn function - auto created by shadcn used for merging tailwind classes dynamically & conditionally . similar to {`${className}?`} 
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// convertToPlainObject function - to convert Prisma objects to plain objects (used at fetching data & fixes a Prisma object issue)
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}


// Format number with decimal places - price is Decimal in the db, which requires precise formatting (used in the zod schema)
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.');                    // Split the number into integer & decimal parts
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;   //ensures nums always have 2 decimal places. example: 49 becomes "49.00".
}


//formatError() - we'll use this function with the sign-up server-action to separete & return the errors (zod/prisma/action errors)
//if we used use-form-state we won't need this, as we will have Zod in a client-side validation
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatError(error: any): string {
  // Handle Zod error
  if (error.name === "ZodError") {    
    const fieldErrors = Object.keys(error.errors).map((field) => {
      const message = error.errors[field].message;
      return typeof message === "string" ? message : JSON.stringify(message);
    });
    return fieldErrors.join("- ");
  // Handle Prisma error
  } else if ( error.name === "PrismaClientKnownRequestError" &&  error.code === "P2002"  ) {    
    const field = error.meta?.target ? error.meta.target[0] : "Field";
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    // Handle other errors
    return typeof error.message === "string" ? error.message : JSON.stringify(error.message);
  }
}