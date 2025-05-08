import { parseWithZod } from "@conform-to/zod";
import { data, isRouteErrorResponse } from "react-router";
import { Db } from "~/api/db.server";
import { verifyStoryForEditing } from "~/lib/story-utils";
import { ChapterImagePicker } from "~/routes/create_.$storySlug.$chapterId/ChapterImagePicker";
import { StoryEditorSchema } from "~/routes/create_.$storySlug.$chapterId/schemas";
import { StoryTitleEditor } from "~/routes/create_.$storySlug.$chapterId/TitleEditor";
import { Image } from "~/routes/image.$id.$type/route";
import type { Route } from "./+types/route";

export default function StoryEditor({
  loaderData: { story, chapter },
}: Route.ComponentProps) {
  return (
    <div>
      <div className="flex items-center gap-4">
        <Image imageId={story.imageId} className="h-32 w-48" />
        <div>
          <StoryTitleEditor title={story.title} />
        </div>
      </div>
      <div>
        <ChapterImagePicker imageId={chapter.imageId} />
      </div>
    </div>
  );
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { story, chapter } = await verifyStoryForEditing(
    request,
    params.storySlug,
    params.chapterId,
  );

  return { story, chapter };
}

export async function action({ request, params }: Route.ActionArgs) {
  console.log("action", request, params);
  await verifyStoryForEditing(request, params.storySlug, params.chapterId);

  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: StoryEditorSchema,
  });

  if (submission.status !== "success") {
    return data(submission.reply(), { status: 400 });
  }

  switch (submission.value.intent) {
    case "title":
      await Db.Story.update(params.storySlug, {
        title: submission.value.title,
      });
      return submission.reply();
    default:
      throw data("Invalid intent", { status: 400 });
  }
}

export async function clientAction({
  request,
  serverAction,
}: Route.ClientActionArgs) {
  console.log("clientAction", request, serverAction);
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      serverAction().then(resolve).catch(reject);
    }, 1000);

    request.signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new Error("Request aborted"));
    });
  });
}

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: `Edit ${data.story.title} | Fiction Dog`,
  },
];

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Something went wrong";
  if (isRouteErrorResponse(error)) {
    message = error.data;
  }
  return <div>{message}</div>;
}
