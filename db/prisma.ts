//THIS FILE IS USED TO SET A STABLE CONNECTION of PRISMA TO NEON DATABASE (Based on neon docs: https://neon.com/docs/guides/prisma)
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';


// Sets up WebSocket connections, which enables Neon to use WebSocket communication.
neonConfig.webSocketConstructor = ws;
const connectionString = `${process.env.DATABASE_URL}`;

// Create the Prisma adapter using the Neon connection to handle the connection between Prisma and Neon.
const adapter = new PrismaNeon({ connectionString });


// Setting the PrismaClient & Extends it with a custom result transformer to convert the price, rating, ... fields Decimal to strings.
// This is needed to avoid TypeScript errors because the Decimal type is not supported in the Neon/prisma adapter.
export const prisma = new PrismaClient({ adapter }).$extends({
  result: {
    product: {
      price: {
        compute(product) {
          return product.price?.toString();
        },
      },
      rating: {
        compute(product) {
          return product.rating?.toString();
        },
      },
      colors: {
        compute(product) {          
          if (!product.colors) return [];               // Handle null/undefined values          
          // Parse JSON string if needed
          if (typeof product.colors === 'string') {
            try { return JSON.parse(product.colors) } catch { return []; }
          }     
          return product.colors;      // Return as-is if already an object
        },
      },
    },
    cart: {
      itemsPrice: {
        needs: { itemsPrice: true },
        compute(cart) {
          return cart.itemsPrice.toString();
        },
      },
      shippingPrice: {
        needs: { shippingPrice: true },
        compute(cart) {
          return cart.shippingPrice.toString();
        },
      },
      taxPrice: {
        needs: { taxPrice: true },
        compute(cart) {
          return cart.taxPrice.toString();
        },
      },
      totalPrice: {
        needs: { totalPrice: true },
        compute(cart) {
          return cart.totalPrice.toString();
        },
      },
    },
    order: {
      itemsPrice: {
        needs: { itemsPrice: true },
        compute(cart) {
          return cart.itemsPrice.toString();
        },
      },
      shippingPrice: {
        needs: { shippingPrice: true },
        compute(cart) {
          return cart.shippingPrice.toString();
        },
      },
      taxPrice: {
        needs: { taxPrice: true },
        compute(cart) {
          return cart.taxPrice.toString();
        },
      },
      totalPrice: {
        needs: { totalPrice: true },
        compute(cart) {
          return cart.totalPrice.toString();
        },
      },
    },
    orderItem: {
      price: {
        compute(cart) {
          return cart.price.toString();
        },
      },
    },
  },
});