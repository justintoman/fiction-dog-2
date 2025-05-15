import { parseWithZod } from "@conform-to/zod";
import { invariant } from "@epic-web/invariant";
import {
  data,
  isRouteErrorResponse,
  useFetchers,
  useSubmit,
} from "react-router";
import { Db } from "~/api/db.server";
import { Button } from "~/components/ui/button";
import type { Choice } from "~/generated/prisma";
import { verifyStoryForEditing } from "~/lib/story-utils";
import { ChoiceEditor } from "~/routes/create_.$storySlug.$chapterId/Choice";
import { Image } from "~/routes/image.$id.$format.$size/route";
import type { Route } from "./+types/route";
import { ChapterContentEditor } from "./ChapterContentEditor";
import { ChapterImagePicker } from "./ChapterImagePicker";
import { StoryEditorSchema } from "./schemas";
import { StoryTitleEditor } from "./TitleEditor";

export default function StoryEditor({
  loaderData: { story, chapter, choices },
}: Route.ComponentProps) {
  const submit = useSubmit();
  const fetchers = useFetchers();
  console.log(choices);
  const pendingChoices = fetchers
    .filter(
      (fetcher) =>
        fetcher.formData?.get("intent") === "new-choice" ||
        fetcher.formData?.get("intent") === "choice-order",
    )
    .map((fetcher) => {
      const id = fetcher.formData?.get("id");
      const order = fetcher.formData?.get("order");
      invariant(typeof id === "string", "id is required");
      invariant(typeof order === "string", "order is required");
      return { id, order: Number(order) };
    });

  const removedChoices = fetchers
    .filter((fetcher) => fetcher.formData?.get("intent") === "remove-choice")
    .map((fetcher) => {
      const id = fetcher.formData?.get("id");
      invariant(typeof id === "string", "id is required");
      return { id };
    });

  const mergedChoices: Choice[] = [];
  for (const choice of choices) {
    if (
      removedChoices.find((removedChoice) => removedChoice.id === choice.id)
    ) {
      continue;
    }
    const pendingChoice = pendingChoices.find(
      (pendingChoice) => pendingChoice.id === choice.id,
    );
    if (pendingChoice) {
      mergedChoices.push({
        ...choice,
        ...pendingChoice,
      });
    } else {
      mergedChoices.push(choice);
    }
  }
  for (const pendingChoice of pendingChoices) {
    if (
      removedChoices.find(
        (removedChoice) => removedChoice.id === pendingChoice.id,
      )
    ) {
      continue;
    }
    if (!mergedChoices.find((choice) => choice.id === pendingChoice.id)) {
      mergedChoices.push(pendingChoice as Choice);
    }
  }

  mergedChoices.sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex min-h-0 items-start">
        <Image
          imageId={story.imageId}
          className="h-24 max-w-30 sm:h-32 sm:w-48"
        />
        <div>
          <StoryTitleEditor title={story.title} />
        </div>
      </div>
      <div>
        <ChapterImagePicker imageId={chapter.imageId} />
      </div>
      <div>
        <ChapterContentEditor description={chapter.content} />
      </div>
      <ul>
        {mergedChoices.map((choice, index) => (
          <ChoiceEditor
            key={choice.id}
            choice={choice}
            previousOrder={mergedChoices[index - 1]?.order ?? 0}
            nextOrder={mergedChoices[index + 1]?.order ?? choice.order + 1}
          />
        ))}
      </ul>
      <div>
        <Button
          type="submit"
          name="intent"
          value="new-choice"
          onClick={() => {
            submit(
              {
                intent: "new-choice",
                id: crypto.randomUUID(),
                order: mergedChoices.length + 1,
              },
              {
                navigate: false,
                method: "post",
              },
            );
          }}
        >
          Add Choice
        </Button>
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
