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
  description: z.string().min(1),
});

export const ChoiceSchema = z.object({
  intent: z.literal("chapter-choice"),
  content: z.string(),
  destination: z.string().optional(),
});

export const AddChoiceSchema = z.object({
  intent: z.literal("add-choice"),
});

export const RemoveChoiceSchema = z.object({
  intent: z.literal("remove-choice"),
  id: z.string(),
});

export const StoryEditorSchema = z.discriminatedUnion("intent", [
  TitleSchema,
  ChapterImageSchema,
  ChapterDescriptionSchema,
  ChoiceSchema,
  AddChoiceSchema,
  RemoveChoiceSchema,
]);
