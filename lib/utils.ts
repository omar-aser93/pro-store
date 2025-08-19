//file that contains utility functions 

// cn function - auto created by shadcn used for merging tailwind classes dynamically & conditionally . similar to {`${className}?`} 
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// convertToPlainObject function - to convert Prisma JSON objects to plain objects (used at fetching data & fixes a Prisma object issue)
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}


// Format number with decimal places - price is Decimal in the db, which requires precise formatting (used in the zod schema)
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split('.');                    // Split the number into integer & decimal parts
  return decimal ? `${int}.${decimal.padEnd(2, '0')}` : `${int}.00`;   //ensures nums always have 2 decimal places. example: 49 becomes "49.00".
}


// Round a number to 2 decimal places, takes either a number or a string , if a string convert it to a number
export const round2 = (value: number | string) => {
  if (typeof value === 'number') {
    return Math.round((value + Number.EPSILON) * 100) / 100;          //EPSILON used to avoid rounding errors
  } else if (typeof value === 'string') {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  } else {
    throw new Error('value is not a number nor a string');
  }
};



const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
  minimumFractionDigits: 2,
});
// Format currency using the formatter above, takes either a number or a string , if a string convert it to a number 
export function formatCurrency(amount: number | string | null) {
  if (typeof amount === 'number') {
    return CURRENCY_FORMATTER.format(amount);
  } else if (typeof amount === 'string') {
    return CURRENCY_FORMATTER.format(Number(amount));
  } else {
    return 'NaN';
  }
}



const NUMBER_FORMATTER = new Intl.NumberFormat('en-US');
// Format Number to a string with commas using the formatter above
export function formatNumber(number: number) {
  return NUMBER_FORMATTER.format(number);
}



// Shorten ID function - to shorten item ID to 4 characters (used in the UI), [e.g., 123456ab becomes "..3456"]
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}



//Format the date in 3 different ways (Date & Time, Date Only, Time Only)
export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // abbreviated month name (e.g., 'Oct')
    day: 'numeric', // numeric day of the month (e.g., '25')
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // numeric year (e.g., '2023')
    day: 'numeric', // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString('en-US', dateTimeOptions);
  const formattedDate: string = new Date(dateString).toLocaleString('en-US', dateOptions);
  const formattedTime: string = new Date(dateString).toLocaleString('en-US', timeOptions);
  return { dateTime: formattedDateTime, dateOnly: formattedDate, timeOnly: formattedTime };
};


// format a JS Date (UTC) into Local Date-Time value acceptable for <input type="datetime-local" />
export const formatDateTimeInput = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};