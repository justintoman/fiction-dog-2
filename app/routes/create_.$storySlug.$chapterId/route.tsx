import { redirect } from "react-router";
import { Image } from "~/routes/image.$id.$type/route";
import { getUser } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";
import type { Route } from "./+types/route";

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }
  const story = await prisma.story.findUnique({
    where: {
      slug: params.storySlug,
    },
    include: {
      chapters: true,
    },
  });

  if (story?.authorId !== user.id) {
    return redirect("/");
  }

  return { story };
}

export default function StoryEditor({
  loaderData: { story },
}: Route.ComponentProps) {
  return (
    <div>
      <h1>Edit Story</h1>
      <div>{story.title}</div>
      <div>
        <Image imageId={story.imageId} />
      </div>
    </div>
  );
}
