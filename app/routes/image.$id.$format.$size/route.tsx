import { invariant } from "@epic-web/invariant";
import type { ComponentProps } from "react";
import { Db } from "~/api/db.server";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/route";
const validFormats = ["webp", "jpeg"] as const;

function isValidFormat(
  format: string,
): format is (typeof validFormats)[number] {
  return validFormats.includes(format as any);
}

const validSizes = ["thumb", "small", "medium", "large"] as const;

function isValidSize(size: string): size is (typeof validSizes)[number] {
  return validSizes.includes(size as any);
}

export async function loader({
  params: { format, size, id },
}: Route.LoaderArgs) {
  invariant(
    isValidFormat(format),
    `invalid image format, must be ${validFormats.join()}`,
  );
  invariant(
    isValidSize(size),
    `invalid image size, must be ${validSizes.join()}`,
  );

  const image = await Db.Image.get(id, format, size);

  return new Response(image.bytes, {
    headers: {
      "Content-Type": `image/${format}`,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export type ImageProps = ComponentProps<"picture"> & {
  imageId: string;
};

export function Image({ imageId, className, ...props }: ImageProps) {
  return (
    <picture {...props}>
      <source
        type="image/webp"
        srcSet={`
          /image/${imageId}/webp/thumb 100w, 
          /image/${imageId}/webp/small 320w,
          /image/${imageId}/webp/medium 640w,
          /image/${imageId}/webp/large 1280w
        `}
        sizes="(max-width: 600px) 320px, (max-width: 900px) 640px, 1280px"
      />

      <source
        type="image/jpeg"
        srcSet={`
          /image/${imageId}/jpeg/thumb 100w,
          /image/${imageId}/jpeg/small 320w,
          /image/${imageId}/jpeg/medium 640w,
          /image/${imageId}/jpeg/large 1280w
        `}
        sizes="(max-width: 600px) 320px, (max-width: 900px) 640px, 1280px"
      />

      <img
        className={cn(className)}
        src={`/image/${imageId}/jpeg/small`}
        alt="Descriptive alt text"
        width="320"
        height="auto"
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}
