import { data, redirect } from "react-router";
import { Db } from "~/api/db.server";
import { getUser } from "~/services/auth.server";

export async function verifyStoryForEditing(
  request: Request,
  storySlug: string,
  chapterId: string,
) {
  const user = await getUser(request);
  if (!user) {
    throw redirect("/login");
  }

  const story = await Db.Story.get(storySlug);
  if (!story) {
    throw data("Story not found", { status: 404 });
  }
  if (story.authorId !== user.id) {
    throw data("You are not authorized to edit this story", { status: 403 });
  }

  const chapter = await Db.Chapter.get(chapterId);
  if (!chapter) {
    throw data("Chapter not found", { status: 404 });
  }

  return { story, chapter };
}
