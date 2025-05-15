import type { Choice as ChoiceType } from "~/generated/prisma";
import { prisma } from "~/services/prisma.server";

type CreateChoiceArgs = Pick<ChoiceType, "id" | "chapterId" | "order">;
type UpdateChoiceArgs = Pick<ChoiceType, "content" | "toChapterId">;

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

  update(id: string, data: Partial<UpdateChoiceArgs>) {
    return prisma.choice.update({
      where: { id },
      data,
    });
  },

  async reorder(chapterId: string, id: string, newOrder: number) {
    // Get all choices for this chapter, ordered by their current order
    const choices = await prisma.choice.findMany({
      where: { chapterId },
      orderBy: { order: "asc" },
    });

    const movedChoice = choices.find((choice) => choice.id === id);
    if (!movedChoice) {
      throw new Error("invalid choice id " + id);
    }

    // If the choice is already at the desired position, do nothing
    if (movedChoice.order === newOrder) {
      return movedChoice;
    }

    // Use a transaction to ensure all updates happen atomically
    return await prisma.$transaction(async (tx) => {
      // First, update the moved choice to a temporary position
      // We use a very large number to avoid conflicts with existing orders
      await tx.choice.update({
        where: { id },
        data: { order: 999999 },
      });

      // If moving up (newOrder < oldOrder), shift choices down
      // If moving down (newOrder > oldOrder), shift choices up
      if (newOrder < movedChoice.order) {
        // Moving up: shift choices between newOrder and oldOrder down by 1
        await tx.choice.updateMany({
          where: {
            chapterId,
            order: {
              gte: newOrder,
              lt: movedChoice.order,
            },
          },
          data: {
            order: { increment: 1 },
          },
        });
      } else {
        // Moving down: shift choices between oldOrder and newOrder up by 1
        await tx.choice.updateMany({
          where: {
            chapterId,
            order: {
              gt: movedChoice.order,
              lte: newOrder,
            },
          },
          data: {
            order: { decrement: 1 },
          },
        });
      }

      // Finally, move the choice to its new position
      return await tx.choice.update({
        where: { id },
        data: { order: newOrder },
      });
    });
  },

  async delete(id: string) {
    const result = await prisma.choice.delete({ where: { id } });
    await prisma.choice.updateMany({
      where: { chapterId: result.chapterId, order: { gt: result.order } },
      data: { order: { decrement: 1 } },
    });
    return result;
  },
});
