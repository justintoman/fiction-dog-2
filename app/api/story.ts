import type { Story as StoryType } from "@prisma/client";
import slugify from "slugify";
import { Chapter } from "~/api/chapter";
import { prisma } from "~/services/prisma.server";

type CreateStoryArgs = Pick<StoryType, "authorId" | "imageId" | "title">;
type UpdateStoryArgs = Partial<
  Pick<StoryType, "imageId" | "title" | "isPublished">
>;

export const Story = Object.freeze({
  getAllPublished() {
    const stories = prisma.story.findMany({
      where: {
        isPublished: true,
      },
    });
    return stories;
  },

  getAllByUser(authorId: string) {
    const stories = prisma.story.findMany({
      where: {
        authorId,
      },
    });
    return stories;
  },

  get(slug: string) {
    const story = prisma.story.findUnique({
      where: {
        slug,
      },
    });

    return story;
  },

  async create(data: CreateStoryArgs) {
    const slug = slugify(data.title.substring(0, 50), {
      lower: true,
      strict: true,
    });
    await prisma.story.create({
      data: {
        slug,
        ...data,
      },
    });

    const firstChapter = await Chapter.create({
      storySlug: slug,
      imageId: data.imageId,
    });

    const story = await prisma.story.update({
      where: { slug },
      data: { firstChapterId: firstChapter.id },
    });

    return story;
  },

  update(slug: string, data: UpdateStoryArgs) {
    return prisma.story.update({
      where: { slug },
      data,
    });
  },
});
