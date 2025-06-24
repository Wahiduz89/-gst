-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FrequentlyUsedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "hsnSacCode" TEXT,
    "hsnSacType" TEXT NOT NULL DEFAULT 'HSN',
    "defaultRate" DECIMAL,
    "defaultGstRate" DECIMAL NOT NULL DEFAULT 18,
    "unitOfMeasurement" TEXT NOT NULL DEFAULT 'NOS',
    "category" TEXT,
    "usageCount" INTEGER NOT NULL DEFAULT 1,
    "lastUsedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FrequentlyUsedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FrequentlyUsedItem" ("category", "createdAt", "defaultGstRate", "defaultRate", "hsnSacCode", "hsnSacType", "id", "itemName", "lastUsedAt", "unitOfMeasurement", "updatedAt", "usageCount", "userId") SELECT "category", "createdAt", coalesce("defaultGstRate", 18) AS "defaultGstRate", "defaultRate", "hsnSacCode", coalesce("hsnSacType", 'HSN') AS "hsnSacType", "id", "itemName", "lastUsedAt", coalesce("unitOfMeasurement", 'NOS') AS "unitOfMeasurement", "updatedAt", coalesce("usageCount", 1) AS "usageCount", "userId" FROM "FrequentlyUsedItem";
DROP TABLE "FrequentlyUsedItem";
ALTER TABLE "new_FrequentlyUsedItem" RENAME TO "FrequentlyUsedItem";
CREATE INDEX "FrequentlyUsedItem_userId_idx" ON "FrequentlyUsedItem"("userId");
CREATE INDEX "FrequentlyUsedItem_hsnSacCode_idx" ON "FrequentlyUsedItem"("hsnSacCode");
CREATE INDEX "FrequentlyUsedItem_usageCount_idx" ON "FrequentlyUsedItem"("usageCount");
CREATE INDEX "FrequentlyUsedItem_lastUsedAt_idx" ON "FrequentlyUsedItem"("lastUsedAt");
CREATE TABLE "new_HsnSacCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "gstRate" DECIMAL,
    "unitOfMeasurement" TEXT NOT NULL DEFAULT 'NOS',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_HsnSacCode" ("category", "code", "createdAt", "description", "gstRate", "id", "isActive", "subCategory", "type", "unitOfMeasurement", "updatedAt") SELECT "category", "code", "createdAt", "description", "gstRate", "id", "isActive", "subCategory", "type", coalesce("unitOfMeasurement", 'NOS') AS "unitOfMeasurement", "updatedAt" FROM "HsnSacCode";
DROP TABLE "HsnSacCode";
ALTER TABLE "new_HsnSacCode" RENAME TO "HsnSacCode";
CREATE UNIQUE INDEX "HsnSacCode_code_key" ON "HsnSacCode"("code");
CREATE INDEX "HsnSacCode_code_idx" ON "HsnSacCode"("code");
CREATE INDEX "HsnSacCode_type_idx" ON "HsnSacCode"("type");
CREATE INDEX "HsnSacCode_category_idx" ON "HsnSacCode"("category");
CREATE INDEX "HsnSacCode_isActive_idx" ON "HsnSacCode"("isActive");
CREATE TABLE "new_InvoiceItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoiceId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "rate" DECIMAL NOT NULL,
    "amount" DECIMAL NOT NULL,
    "gstRate" DECIMAL NOT NULL,
    "cgst" DECIMAL NOT NULL,
    "sgst" DECIMAL NOT NULL,
    "igst" DECIMAL NOT NULL,
    "totalAmount" DECIMAL NOT NULL,
    "hsnSacCode" TEXT,
    "hsnSacType" TEXT NOT NULL DEFAULT 'HSN',
    "itemCategory" TEXT,
    "itemSubCategory" TEXT,
    "unitOfMeasurement" TEXT NOT NULL DEFAULT 'NOS',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InvoiceItem_hsnSacCode_fkey" FOREIGN KEY ("hsnSacCode") REFERENCES "HsnSacCode" ("code") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_InvoiceItem" ("amount", "cgst", "createdAt", "description", "gstRate", "hsnSacCode", "hsnSacType", "id", "igst", "invoiceId", "itemCategory", "itemSubCategory", "quantity", "rate", "sgst", "totalAmount", "unitOfMeasurement", "updatedAt") SELECT "amount", "cgst", "createdAt", "description", "gstRate", "hsnSacCode", coalesce("hsnSacType", 'HSN') AS "hsnSacType", "id", "igst", "invoiceId", "itemCategory", "itemSubCategory", "quantity", "rate", "sgst", "totalAmount", coalesce("unitOfMeasurement", 'NOS') AS "unitOfMeasurement", "updatedAt" FROM "InvoiceItem";
DROP TABLE "InvoiceItem";
ALTER TABLE "new_InvoiceItem" RENAME TO "InvoiceItem";
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");
CREATE INDEX "InvoiceItem_hsnSacCode_idx" ON "InvoiceItem"("hsnSacCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
