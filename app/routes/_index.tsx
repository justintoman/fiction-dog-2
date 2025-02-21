import { eq } from "drizzle-orm";
import { db } from "~/db/db.server";
import type { Route } from "./+types/_index";
import { stories } from "~/db/schema.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Fiction Dawg" },
    { name: "description", content: "You're the fiction now, dawg" },
  ];
}

export async function loader() {
  const data = await db.select({
    title: stories.title,
    slug: stories.slug
  }).from(stories).where(
     eq(stories.isPublished, true),
  );

  return data;
}

export default function Home({ loaderData }: Route.ComponentProps) {

  return <div>
    <h1 className="text-2xl my-8">Welcome to Fiction Dog</h1>
    <div>
      <h2>Stories</h2>
      <p>There are {loaderData?.length} stories</p>
    </div>
    <div>
      
      {loaderData?.map((story) => (
        <div key={story.slug}>
          <h2>{story.title}</h2>
        </div>
      ))}
      </div>
    </div>;
}
