import type { Story as StoryType } from "@prisma/client";
import { prisma } from "~/services/prisma.server";

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
    const story = prisma.story.findUniqueOrThrow({
      where: {
        slug,
      },
    });

    return story;
  },

  // create(newStory: StoryType)
});
