//zod validation file. we use it to validate data before inserting it to the db, also to create a TS types for our data.
import { z } from 'zod';
import { formatNumberWithDecimal } from './utils';

//Define currency variable that will be used in some of our zod schemas, it refines value to ensure it has exactly 2 decimal places (e.g., 49.99)
const currency = z.string().refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))), 'Price must have exactly two decimal places'
);

//Zod Schema for validating inserting a product
export const insertProductSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  category: z.string().min(3, 'Category must be at least 3 characters'),
  brand: z.string().min(3, 'Brand must be at least 3 characters'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  stock: z.coerce.number(),              //coerce.number() to convert string values to number
  images: z.array(z.string()).min(1, 'Product must have at least one image'),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),         //nullable() to allow null values for (optional) fields
  price: currency,  
  // colors is an array of objects, each object has name, images(array of strings), sizes(array of objects with size & stock)
  colors: z.array(z.object({ name: z.string().min(1, "Color name required"), images: z.array(z.string()).min(1, "At least one image required"),
    sizes: z.array(z.object({ size: z.enum(["XS", "S", "M", "L", "XL", "XXL", "XXXL"]), stock: z.number().min(0).default(0)})).default([]) })
  ).default([])
});
//We use `z.infer` to create a product TS type & include all fields of the Schema + other fields not included in the form
export type Product = z.infer<typeof insertProductSchema> & { 
    id: string; 
    createdAt: Date; 
    rating: string;             //it's decimal in the db, but we set it to string because TS doesn't have a decimal type
    numReviews: number; 
};


// Zod Schema for validating updating a product (it inherits all insertProductSchema items & extends it with id field)
export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, 'Id is required'),
});
//We use `z.infer` to create an updateProduct TS type
export type updateProductType = z.infer<typeof updateProductSchema>;


//Zod Schema for validating signing in a user
export const signInFormSchema = z.object({
  email: z.string().email('Invalid email address').min(3, 'Email must be at least 3 characters'),
  password: z.string().min(3, 'Password must be at least 3 characters'),
});
//We use `z.infer` to create a signIn TS type & include all fields of the Schema + callbackUrl(hidden field we need) in the form
export type signInType = z.infer<typeof signInFormSchema> & { callbackUrl: string };


//Zod Schema for validating signing up a user
export const signUpFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().min(3, "Email must be at least 3 characters"),
  password: z.string().min(3, "Password must be at least 3 characters"),
  //.refine() to add a custom validation for passwords matching 
  confirmPassword: z.string().min(3, "Confirm password must be at least 3 characters") })
    .refine((data) => data.password === data.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"]
});
//We use `z.infer` to create a signUp TS type & include all fields of the Schema + callbackUrl(hidden field we need) in the form
export type signUpType = z.infer<typeof signUpFormSchema> & { callbackUrl: string };


// Zod Schema for forgot-Password email input
export const forgotPasswordSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?\d{10,15}$/, { message: "Phone number must be 10–15 digits and may start with +" }).optional(),
}).refine((data) => data.email || data.phone, { message: "Please provide either email or phone", path: ["email"]});
//We use `z.infer` to create a forgotPassword TS type
export type forgotPasswordType = z.infer<typeof forgotPasswordSchema>;


// Zod Schema for validating OTP input (6 digits)
export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d{6}$/, "OTP must contain only digits"),
});
//We use `z.infer` to create a otp TS type & include all fields of the Schema + email/phone (passed as a query param to the verify-otp page)
export type otpType = z.infer<typeof otpSchema> & { email?: string; phone?: string };  


// Zod Schema for validating Reset Password 
export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters long").max(64, "Password is too long"),
  confirmPassword: z.string() })
  //.refine() to add a custom validation for passwords matching 
  .refine((data) => data.newPassword === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" 
});
//We use `z.infer` to create a resetPassword TS type & include all fields of the Schema + email/phone (passed as a query param to the page)
export type resetPasswordType = z.infer<typeof resetPasswordSchema> & { email?: string; phone?: string; };  


// Zod Schema for validating Update Profile 
export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().min(3, 'Email must be at least 3 characters'),
  phone: z.string().regex(/^\+?\d{10,15}$/, "Phone number must be 10–15 digits and may start with +").optional().or(z.literal('')).or(z.null()),
});
//We use `z.infer` to create an updateProfile TS type
export type updateProfileType = z.infer<typeof updateProfileSchema>;


// Zod Schema for validating Update User by admin (it inherits all updateProfileSchema items & extends it with id & role)
export const updateUserSchema = updateProfileSchema.extend({
  id: z.string().min(1, 'Id is required'),  
  role: z.string().min(1, 'Role is required'),
});
//We use `z.infer` to create an updateUser TS type
export type updateUserType = z.infer<typeof updateUserSchema>;


//Zod Schema for validating Cart Item
export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  qty: z.number().int().nonnegative('Quantity must be a non-negative number'),      //.nonnegative() to ensure it's a positive number
  image: z.string().min(1, 'Image is required'),
  color: z.string().optional().nullable(),
  size: z.string().optional().nullable(), 
  price: currency
});
//We use `z.infer` to create a cartItem TS type 
export type cartItemType = z.infer<typeof cartItemSchema>;


//Zod Schema for validating insert Cart
export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),                   //array of cartItem Schemas (we created it above this schema)
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, 'Session cart id is required'),
  userId: z.string().optional().nullable(),         //optional when user isn't logged in yet but required at checkout
});
//We use `z.infer` to create a cartItem TS type 
export type Cart = z.infer<typeof insertCartSchema>;


//Zod Schema for validating shipping Address at checkout
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  streetAddress: z.string().min(3, 'Address must be at least 3 characters'),
  city: z.string().min(3, 'city must be at least 3 characters'),
  postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
  country: z.string().min(3, 'Country must be at least 3 characters'),
  lat: z.number().optional(),
  lng: z.number().optional(),
});
//We use `z.infer` to create a shipping Address TS type
export type shippingAddressType = z.infer<typeof shippingAddressSchema>;


//Zod Schema for validating Payment methodes (we defined 3 types of payment methods in the .env file)
export const paymentMethodSchema = z.object({
  type: z.string().min(1, 'Pyament method is required'), })
  .refine((data) => process.env.NEXT_PUBLIC_PAYMENT_METHODS?.split(', ').includes(data.type), { path: ['type'], message: 'Invalid payment method'
  });
//We use `z.infer` to create a payment Method TS type
export type paymentMethodType = z.infer<typeof paymentMethodSchema>;


//Zod Schema for validating inserting an Order
export const insertOrderSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => process.env.NEXT_PUBLIC_PAYMENT_METHODS?.split(', ').includes(data), {
    message: 'Invalid payment method',
  }),
  shippingAddress: shippingAddressSchema,
});
//We use `z.infer` to create an Order TS type
export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;
  orderItems: OrderItem[];
  user: { name: string; email: string };
  paymentResult: paymentResultType;
};


//Zod Schema for validating Order Item
export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  qty: z.number(),
  color: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
});
//We use `z.infer` to create an OrderItem TS type
export type OrderItem = z.infer<typeof insertOrderItemSchema>;


//Zod Schema for validating paypal payment result
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});
//We use `z.infer` to create a paymentResult TS type
export type paymentResultType = z.infer<typeof paymentResultSchema>;


// Zod Schema for validating Insert a Review 
export const insertReviewSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(3, 'Description must be at least 3 characters'),
  productId: z.string().min(1, 'Product is required'),
  userId: z.string().min(1, 'User is required'),
  rating: z.coerce.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
});
//We use `z.infer` to create a Review TS type
export type Review = z.infer<typeof insertReviewSchema> & { id: string; createdAt: Date; user?: { name: string }; };


//Zod Schema for validating inserting in subscribe form
export const NewsletterSchema = z.object({
  email: z.string().email("Invalid email address"),  
})
//We use `z.infer` to create an Newsletter TS type
export type NewsletterType = z.infer<typeof NewsletterSchema>;


// Zod Schema for validating Newsletter Form (admin)
export const newsletterFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  attachments: z.any().optional(), 
});
//We use `z.infer` to create an Newsletter form TS type
export type NewsletterFormData = z.infer<typeof newsletterFormSchema>;


// multi language schema (will be used for title and description) of (deal of the month) Zod Schema
const LanguageSchema = z.object({lang: z.string().min(2), content: z.string().min(3)})
// Zod Schema for (deal of the month) form validation (admin)
export const dealFormSchema = z.object({
  titles: z.array(LanguageSchema).min(1, { message: "At least one title is required" }),
  descriptions: z.array(LanguageSchema).min(1, { message: "At least one description is required" }),
  imageUrl: z.string().min(1, 'Image is required'),
  imageLink: z.string().optional().nullable(),
  buttonLink: z.string().default('/search'),
  targetDate: z.coerce.date()
})
//We use `z.infer` to create a Deal form TS type
export type DealFormType = z.infer<typeof dealFormSchema>;


// Zod Schema for validating sending a chat Message
export const sendMessageSchema = z.object({
  chatId: z.string().min(1),
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  fileType: z.string().optional().nullable(), 
});
//We use `z.infer` to create a SendMessageInput TS type
export type SendMessageType = z.infer<typeof sendMessageSchema>;


// Message schema (received/displayed message) Type
export const messageSchema = z.object({
  id: z.string(),
  content: z.string().nullable().optional(), 
  fileUrl: z.string().nullable().optional(),
  fileType: z.string().nullable().optional(),
  createdAt: z.date(),
  isRead: z.boolean(),
  isEdited: z.boolean().optional(),     
  isDeleted: z.boolean().optional(),
  sender: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string()
  }),
});
// we use `z.infer` to create a Message TS type
export type MessageType = z.infer<typeof messageSchema>;


// Chat schema (for chat Type), it includes the chat's messages and user information
export const chatSchema = z.object({
  id: z.string(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isActive: z.boolean(),
  lastMessage: z.string().optional(),  
  messages: z.array(messageSchema),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
});
// We use `z.infer` to create a Chat TS type
export type ChatType = z.infer<typeof chatSchema>;


// Zod Schema for validating Calendar Summary (admin)
export const calendarSummarySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});
//We use `z.infer` to create a Calendar Summary TS type
export type CalendarSummaryType = z.infer<typeof calendarSummarySchema>;