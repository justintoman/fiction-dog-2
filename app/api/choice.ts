import type { Choice as ChoiceType } from "@prisma/client";
import { prisma } from "~/services/prisma.server";

type UpdateChoiceArgs = Pick<ChoiceType, "content" | "toChapterId">;

export const Choice = Object.freeze({
  create(chapterId: string) {
    return prisma.choice.create({
      data: {
        chapterId,
        content: "",
      },
    });
  },

  get(chapterId: string) {
    return prisma.choice.findMany({
      where: {
        chapterId,
      },
    });
  },

  update(id: string, data: UpdateChoiceArgs) {
    return prisma.choice.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.choice.delete({ where: { id } });
  },
});
