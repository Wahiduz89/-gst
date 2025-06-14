-- Migration to add HSN/SAC codes support
-- File: prisma/migrations/add_hsn_sac_codes/migration.sql

-- Add HSN/SAC code columns to InvoiceItem table
ALTER TABLE "InvoiceItem" ADD COLUMN "hsnSacCode" TEXT;
ALTER TABLE "InvoiceItem" ADD COLUMN "hsnSacType" TEXT CHECK ("hsnSacType" IN ('HSN', 'SAC')) DEFAULT 'HSN';
ALTER TABLE "InvoiceItem" ADD COLUMN "itemCategory" TEXT;
ALTER TABLE "InvoiceItem" ADD COLUMN "itemSubCategory" TEXT;
ALTER TABLE "InvoiceItem" ADD COLUMN "unitOfMeasurement" TEXT DEFAULT 'NOS';

-- Create HSN/SAC codes lookup table
CREATE TABLE "HsnSacCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL UNIQUE,
    "type" TEXT NOT NULL CHECK ("type" IN ('HSN', 'SAC')),
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "gstRate" DECIMAL,
    "unitOfMeasurement" TEXT DEFAULT 'NOS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create indexes for efficient lookups
CREATE INDEX "HsnSacCode_code_idx" ON "HsnSacCode"("code");
CREATE INDEX "HsnSacCode_type_idx" ON "HsnSacCode"("type");
CREATE INDEX "HsnSacCode_category_idx" ON "HsnSacCode"("category");
CREATE INDEX "HsnSacCode_isActive_idx" ON "HsnSacCode"("isActive");

-- Create frequently used items table for user-specific quick access
CREATE TABLE "FrequentlyUsedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "hsnSacCode" TEXT,
    "hsnSacType" TEXT CHECK ("hsnSacType" IN ('HSN', 'SAC')) DEFAULT 'HSN',
    "defaultRate" DECIMAL,
    "defaultGstRate" DECIMAL DEFAULT 18,
    "unitOfMeasurement" TEXT DEFAULT 'NOS',
    "category" TEXT,
    "usageCount" INTEGER DEFAULT 1,
    "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FrequentlyUsedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for frequently used items
CREATE INDEX "FrequentlyUsedItem_userId_idx" ON "FrequentlyUsedItem"("userId");
CREATE INDEX "FrequentlyUsedItem_hsnSacCode_idx" ON "FrequentlyUsedItem"("hsnSacCode");
CREATE INDEX "FrequentlyUsedItem_usageCount_idx" ON "FrequentlyUsedItem"("usageCount");
CREATE INDEX "FrequentlyUsedItem_lastUsedAt_idx" ON "FrequentlyUsedItem"("lastUsedAt");

-- Add foreign key reference from InvoiceItem to HsnSacCode
CREATE INDEX "InvoiceItem_hsnSacCode_idx" ON "InvoiceItem"("hsnSacCode");