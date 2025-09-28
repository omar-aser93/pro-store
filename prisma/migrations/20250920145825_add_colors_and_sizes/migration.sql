/*
  Warnings:

  - You are about to drop the column `sizes` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Product" DROP COLUMN "sizes";

-- DropEnum
DROP TYPE "public"."Size";
