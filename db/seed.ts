//seed file to add a sample-data & seed it to the database using PrismaClient 
import { PrismaClient } from '@prisma/client';
import sampleData from './sample-data';


async function main() {
  const prisma = new PrismaClient();                   // Create a PrismaClient instance
 
  // Delete/clean all prev products/users in the db models before seeding the sample data
  await prisma.product.deleteMany();   
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  //createMany function to seed the sample data to the database, then log a success message
  await prisma.product.createMany({ data: sampleData.products });
  await prisma.user.createMany({ data: sampleData.users });  
  console.log('Database seeded successfully');
}

main();                //Call the main function 