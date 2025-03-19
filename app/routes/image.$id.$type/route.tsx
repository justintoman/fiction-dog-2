import { invariant } from "@epic-web/invariant";
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
  switch (type) {
    case "source":
      return image.source;
    case "webp":
      return image.webp;
    case "png":
      return image.png;
  }
}
