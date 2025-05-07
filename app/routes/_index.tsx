import { Link } from "react-router";
import { Db } from "~/api/db.server";
import { getUserId } from "~/services/auth.server";
import type { Route } from "./+types/_index";
import { Image } from "./image.$id.$type/route";

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  if (!userId) {
    return { stories: [] };
  }
  return { stories: await Db.Story.getAllByUser(userId) };
}

export default function Welcome({ loaderData }: Route.ComponentProps) {
  return (
    <main className="pt-16 pb-4">
      <div className="flex justify-between px-8">
        {loaderData.stories.length ? (
          <div className="flex flex-wrap gap-4">
            {loaderData.stories.map((story) => (
              <div
                key={story.slug}
                className="bg-accent flex h-48 w-48 flex-col"
              >
                <Link to={`create/${story.slug}/${story.firstChapterId}`}>
                  <h2>{story.title}</h2>
                </Link>
                <Image className="grow-1" imageId={story.imageId} />
              </div>
            ))}
          </div>
        ) : (
          <h1>Eventually you&apos;ll see a list of stories here</h1>
        )}
      </div>
    </main>
  );
}
