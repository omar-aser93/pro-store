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