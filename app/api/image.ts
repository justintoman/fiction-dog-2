import type { Image as ImageType } from "@prisma/client";
import { prisma } from "~/services/prisma.server";

type CreateImageArgs = Pick<ImageType, "source" | "webp" | "png">;
type UpdateImageArgs = CreateImageArgs;

export const Image = Object.freeze({
  create(data: CreateImageArgs) {
    return prisma.image.create({
      data,
    });
  },

  update(id: string, data: UpdateImageArgs) {
    return prisma.image.update({
      where: { id },
      data,
    });
  },

  delete(id: string) {
    return prisma.image.delete({ where: { id } });
  },
});
