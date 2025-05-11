/*
  Warnings:

  - You are about to drop the column `fromChapterId` on the `Choice` table. All the data in the column will be lost.
  - Added the required column `chapterId` to the `Choice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Choice` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Choice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "chapterId" TEXT NOT NULL,
    "toChapterId" TEXT,
    CONSTRAINT "Choice_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Choice_toChapterId_fkey" FOREIGN KEY ("toChapterId") REFERENCES "Chapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Choice" ("id", "toChapterId") SELECT "id", "toChapterId" FROM "Choice";
DROP TABLE "Choice";
ALTER TABLE "new_Choice" RENAME TO "Choice";
CREATE UNIQUE INDEX "Choice_chapterId_order_key" ON "Choice"("chapterId", "order");
CREATE TABLE "new_Story" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "firstChapterId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Story_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Story_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Story" ("authorId", "firstChapterId", "imageId", "slug", "title") SELECT "authorId", "firstChapterId", "imageId", "slug", "title" FROM "Story";
DROP TABLE "Story";
ALTER TABLE "new_Story" RENAME TO "Story";
CREATE UNIQUE INDEX "Story_imageId_key" ON "Story"("imageId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
