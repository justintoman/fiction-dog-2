import sharp from "sharp";
import type { ImageFormat, ImageSize, ImageVariant } from "~/generated/prisma";
import { prisma } from "~/services/prisma.server";

// type CreateImageArgs = ImageVariant[];
// type UpdateImageArgs = Pick<ImageType, "chapterId" | "storyId" | "user">;

type CreateImageVariantArgs = Omit<
  ImageVariant,
  "id" | "imageId" | "createdAt"
>;

export const Image = Object.freeze({
  async create(data: Blob) {
    const [image, variants] = await Promise.all([
      prisma.image.create({
        data: {}, // Empty data object is fine since id has @default(cuid())
      }),
      generateVariants(data),
    ]);
    await prisma.imageVariant.createMany({
      data: variants.map((variant) => ({
        ...variant,
        imageId: image.id,
      })),
    });
    return image;
  },

  async get(
    id: string,
    format: ImageFormat | Lowercase<ImageFormat>,
    size: ImageSize | Lowercase<ImageSize>,
  ) {
    const variant = await prisma.imageVariant.findFirst({
      where: {
        imageId: id,
        format: format.toUpperCase() as ImageFormat,
        size: size.toUpperCase() as ImageSize,
      },
    });
    if (!variant) {
      throw new Error("Variant not found");
    }
    return variant;
  },

  // update(id: string, data: UpdateImageArgs) {
  //   return prisma.image.update({
  //     where: { id },
  //     data,
  //   });
  // },

  delete(id: string) {
    return prisma.image.delete({ where: { id } });
  },
});

async function generateVariants(
  blob: Blob,
): Promise<Array<CreateImageVariantArgs>> {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const image = sharp(buffer).rotate(); // auto-orient

  const metadata = await image.metadata();
  const aspectRatio = (metadata.width ?? 1) / (metadata.height ?? 1);

  const results: Array<CreateImageVariantArgs> = [];

  for (const size of Object.keys(sizes) as ImageSize[]) {
    const width = sizes[size];
    const height = Math.round(width / aspectRatio);

    const resized = image.clone().resize({ width });

    for (const format of formats) {
      const bytes = await resized.clone()[format]().toBuffer();

      results.push({
        format: format.toUpperCase() as ImageFormat,
        size,
        width,
        height,
        bytes,
      });
    }
  }

  return results;
}

const sizes = {
  THUMB: 100,
  SMALL: 320,
  MEDIUM: 640,
  LARGE: 1280,
} satisfies Record<ImageSize, number>;

const formats = ["webp", "jpeg"] satisfies Lowercase<ImageFormat>[];
