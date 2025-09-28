-- Drop the old composite PK constraint
ALTER TABLE "public"."OrderItem"
DROP CONSTRAINT IF EXISTS "orderItems_orderId_productId_pk";

-- Add the new id column if not already present
ALTER TABLE "public"."OrderItem"
ADD COLUMN IF NOT EXISTS "id" UUID DEFAULT gen_random_uuid();

-- Populate id for existing rows (important if column existed but empty)
UPDATE "public"."OrderItem"
SET id = gen_random_uuid()
WHERE id IS NULL;

-- Make id the primary key
ALTER TABLE "public"."OrderItem"
ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id");

-- Add the unique index for variant uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS "orderItems_variant_unique"
ON "public"."OrderItem"("orderId", "productId", "size", "color");
