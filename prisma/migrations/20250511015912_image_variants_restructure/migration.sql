/*
  Warnings:

  - You are about to drop the column `png` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `source` on the `Image` table. All the data in the column will be lost.
  - You are about to drop the column `webp` on the `Image` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "ImageVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageId" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "bytes" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ImageVariant_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY
);
INSERT INTO "new_Image" ("id") SELECT "id" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ImageVariant_imageId_format_size_key" ON "ImageVariant"("imageId", "format", "size");
