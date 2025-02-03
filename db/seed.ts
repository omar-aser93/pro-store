//seed file to add a sample-data & seed it to the database using PrismaClient 
import { PrismaClient } from '@prisma/client';
import sampleData from './sample-data';

async function main() {
  const prisma = new PrismaClient();                   // Create a PrismaClient instance
  await prisma.product.deleteMany();                   // Delete all prev products in the db
  //createMany method to seed the sample data to the database, then log a success message
  await prisma.product.createMany({ data: sampleData.products });
  console.log('Database seeded successfully');
}

main();                //Call the main function 