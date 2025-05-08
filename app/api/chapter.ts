import type { Chapter as ChapterType } from "@prisma/client";
import { prisma } from "~/services/prisma.server";

type CreateChapterArgs = Pick<ChapterType, "storySlug" | "imageId">;
type UpdateChapterArgs = Partial<Pick<ChapterType, "content" | "imageId">>;

export const Chapter = Object.freeze({
  create(data: CreateChapterArgs) {
    return prisma.chapter.create({
      data: {
        ...data,
        content: "",
      },
    });
  },

  get(id: string) {
    return prisma.chapter.findUnique({ where: { id } });
  },

  update(id: string, data: UpdateChapterArgs) {
    return prisma.chapter.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.chapter.delete({ where: { id } });
  },
});
