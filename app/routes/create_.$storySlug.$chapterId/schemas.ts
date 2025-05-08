import { z } from "zod";

export const TitleSchema = z.object({
  intent: z.literal("title"),
  title: z.string().min(10),
});

export const StoryEditorSchema = z.discriminatedUnion("intent", [TitleSchema]);
