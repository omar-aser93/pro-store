-- CreateEnum
CREATE TYPE "Size" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "color" TEXT,
ADD COLUMN     "size" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "colors" JSON NOT NULL DEFAULT '[]',
ADD COLUMN     "sizes" "Size"[];
