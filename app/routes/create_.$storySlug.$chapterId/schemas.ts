import { z } from "zod";

export const TitleSchema = z.object({
  intent: z.literal("title"),
  title: z.string().min(10),
});

export const ChapterImageSchema = z.object({
  intent: z.literal("chapter-image"),
  imageId: z.string().min(1),
});

export const StoryEditorSchema = z.discriminatedUnion("intent", [
  TitleSchema,
  ChapterImageSchema,
]);
