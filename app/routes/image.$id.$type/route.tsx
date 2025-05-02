import { invariant } from "@epic-web/invariant";
import type { ComponentProps } from "react";
import { prisma } from "~/services/prisma.server";
import type { Route } from "./+types/route";

const validTypes = ["source", "webp", "png"] as const;

function isValidType(type: string): type is (typeof validTypes)[number] {
  return validTypes.includes(type as any);
}

export async function loader({ params: { type, id } }: Route.LoaderArgs) {
  invariant(
    isValidType(type),
    `invalid image type, must be ${validTypes.join()}`,
  );

  const image = await prisma.image.findUniqueOrThrow({
    where: {
      id,
    },
  });
  function response(body: BodyInit) {
    return new Response(body, {
      headers: {
        "Content-Type": `image/${type}`,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }
  switch (type) {
    case "source":
      return response(image.source);
    case "webp":
      return response(image.webp);
    case "png":
      return response(image.png);
  }
}

export type ImageProps = ComponentProps<"picture"> & {
  imageId: string;
};

export function Image({ imageId, ...props }: ImageProps) {
  return (
    <picture {...props}>
      <source srcSet={`/image/${imageId}/webp`} />
      <source srcSet={`/image/${imageId}/png`} />
      <img src={`/image/${imageId}/source`} />
    </picture>
  );
}
