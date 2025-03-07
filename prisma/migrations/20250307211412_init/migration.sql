-- CreateTable
CREATE TABLE "Story" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "imageId" INTEGER NOT NULL,
    "firstChapterId" INTEGER,
    CONSTRAINT "Story_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Story_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "storySlug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageId" INTEGER NOT NULL,
    CONSTRAINT "Chapter_storySlug_fkey" FOREIGN KEY ("storySlug") REFERENCES "Story" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Chapter_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Choice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fromChapterId" INTEGER NOT NULL,
    "toChapterId" INTEGER NOT NULL,
    CONSTRAINT "Choice_fromChapterId_fkey" FOREIGN KEY ("fromChapterId") REFERENCES "Chapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Choice_toChapterId_fkey" FOREIGN KEY ("toChapterId") REFERENCES "Chapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageId" INTEGER NOT NULL,
    CONSTRAINT "User_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Image" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Image" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "source" BLOB NOT NULL,
    "webp" BLOB NOT NULL,
    "png" BLOB NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Story_imageId_key" ON "Story"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_imageId_key" ON "Chapter"("imageId");

-- CreateIndex
CREATE UNIQUE INDEX "Choice_fromChapterId_toChapterId_key" ON "Choice"("fromChapterId", "toChapterId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_imageId_key" ON "User"("imageId");
