import type { Choice as ChoiceType } from "~/generated/prisma";
import { prisma } from "~/services/prisma.server";

type CreateChoiceArgs = Pick<ChoiceType, "id" | "chapterId" | "order">;
type UpdateChoiceArgs = Pick<ChoiceType, "id"> &
  Partial<Pick<ChoiceType, "content" | "toChapterId" | "order">>;

export const Choice = Object.freeze({
  create(data: CreateChoiceArgs) {
    return prisma.choice.create({
      data: {
        ...data,
        content: "",
      },
    });
  },

  get(chapterId: string) {
    return prisma.choice.findMany({
      where: {
        chapterId,
      },
      orderBy: { order: "asc" },
    });
  },

  update({ id, ...data }: UpdateChoiceArgs) {
    return prisma.choice.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.choice.delete({ where: { id } });
  },
});
