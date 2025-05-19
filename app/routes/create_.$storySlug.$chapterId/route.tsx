import { parseWithZod } from "@conform-to/zod";
import { data, isRouteErrorResponse } from "react-router";
import { Db } from "~/api/db.server";
import { verifyStoryForEditing } from "~/lib/story-utils";
import { Image } from "~/routes/image.$id.$format.$size/route";
import type { Route } from "./+types/route";
import { ChapterContentEditor } from "./ChapterContentEditor";
import { ChapterImagePicker } from "./ChapterImagePicker";
import { ChoiceEditor } from "./ChoiceEditor";
import { NewChoiceButton } from "./NewChoiceButton";
import { StoryEditorSchema } from "./schemas";
import { StoryTitleEditor } from "./TitleEditor";
import { usePendingChoices } from "./usePendingChoices";
export default function StoryEditor({
  loaderData: { story, chapter, choices },
}: Route.ComponentProps) {
  const mergedChoices = usePendingChoices(choices);

  return (
    <div>
      <div className="flex min-h-0 items-start">
        <Image
          imageId={story.imageId}
          className="h-24 max-w-30 sm:h-32 sm:w-48"
        />
        <div>
          <StoryTitleEditor title={story.title} />
        </div>
      </div>
      <div className="flex gap-4">
        <div>
          <ChapterImagePicker imageId={chapter.imageId} />
          <ChapterContentEditor description={chapter.content} />
        </div>
        <div className="mt-8">
          <ul className="space-y-2">
            {mergedChoices.map((choice, index) => (
              <ChoiceEditor
                key={choice.id}
                choice={choice}
                previousOrder={
                  mergedChoices[index - 1]?.order ?? choice.order - 1
                }
                nextOrder={mergedChoices[index + 1]?.order ?? choice.order + 1}
              />
            ))}
          </ul>
          <div className="mt-4">
            <NewChoiceButton choiceCount={mergedChoices.length} />
          </div>
        </div>
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

  const choices = await Db.Choice.get(chapter.id);

  return { story, chapter, choices };
}

export async function action({ request, params }: Route.ActionArgs) {
  await verifyStoryForEditing(request, params.storySlug, params.chapterId);

  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: StoryEditorSchema,
  });

  console.log("submission", submission);

  if (submission.status !== "success") {
    return data(submission.reply(), { status: 400 });
  }

  switch (submission.value.intent) {
    // story
    case "title":
      await Db.Story.update({
        slug: params.storySlug,
        title: submission.value.title,
      });
      return submission.reply();

    // chapers
    case "chapter-image":
      await Db.Chapter.update({
        id: params.chapterId,
        imageId: submission.value.imageId,
      });
      return submission.reply();
    case "chapter-description":
      await Db.Chapter.update({
        id: params.chapterId,
        content: submission.value.description,
      });
      return submission.reply();

    // choices
    case "new-choice":
      await Db.Choice.create({
        id: submission.value.id,
        chapterId: params.chapterId,
        order: submission.value.order,
      });
      return submission.reply();
    case "choice-content":
      await Db.Choice.update({
        id: submission.value.id,
        content: submission.value.content,
      });
      return submission.reply();
    case "choice-order":
      await Db.Choice.update({
        id: submission.value.id,
        order: submission.value.order,
      });
      return submission.reply();
    case "choice-target":
      await Db.Choice.update({
        id: submission.value.id,
        toChapterId: submission.value.toChapterId,
      });
      return submission.reply();
    case "remove-choice":
      await Db.Choice.delete(submission.value.id);
      return submission.reply();

    default:
      throw data("Invalid intent", { status: 400 });
  }
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
