import { z } from "zod";

export const TitleSchema = z.object({
  intent: z.literal("title"),
  title: z.string().min(10),
});

export const ChapterImageSchema = z.object({
  intent: z.literal("chapter-image"),
  imageId: z.string().min(1),
});

export const ChapterDescriptionSchema = z.object({
  intent: z.literal("chapter-description"),
  description: z.string(),
});

export const NewChoiceSchema = z.object({
  intent: z.literal("new-choice"),
  id: z.string(),
  order: z.number(),
});

export const ChoiceOrderSchema = z.object({
  intent: z.literal("choice-order"),
  id: z.string(),
  order: z.number(),
});

export const ChoiceContentSchema = z.object({
  intent: z.literal("choice-content"),
  id: z.string(),
  content: z.string(),
});

export const ChoiceTargetSchema = z.object({
  intent: z.literal("choice-target"),
  id: z.string(),
  toChapterId: z.string(),
});

export const RemoveChoiceSchema = z.object({
  intent: z.literal("remove-choice"),
  id: z.string(),
});

export const StoryEditorSchema = z.discriminatedUnion("intent", [
  TitleSchema,
  ChapterImageSchema,
  ChapterDescriptionSchema,
  NewChoiceSchema,
  RemoveChoiceSchema,
  ChoiceOrderSchema,
  ChoiceContentSchema,
  ChoiceTargetSchema,
]);
