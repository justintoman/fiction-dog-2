import { getFormProps, getTextareaProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useFetcher, useParams } from "react-router";
import { ErrorList } from "~/components/ErrorsList";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ChapterDescriptionSchema } from "./schemas";

export function ChapterContentEditor({ description }: { description: string }) {
  const fetcher = useFetcher();
  const { storySlug, chapterSlug } = useParams();
  const [form, fields] = useForm({
    defaultValue: {
      description,
    },
    constraint: getZodConstraint(ChapterDescriptionSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: ChapterDescriptionSchema,
      });
    },
  });

  return (
    <fetcher.Form
      method="post"
      {...getFormProps(form)}
      className="w-full space-y-2 p-2"
    >
      <input name="intent" value="chapter-description" type="hidden" />
      <Label className="sr-only" htmlFor={fields.description.id}>
        Chapter Content
      </Label>
      <Textarea
        placeholder="Chapter description"
        {...getTextareaProps(fields.description)}
        rows={10}
        onChange={(e) => {
          fetcher.submit(e.currentTarget.form, {
            method: "post",
            action: `/create/${storySlug}/${chapterSlug}/d`,
          });
        }}
        onBlur={(e) => {
          fetcher.submit(e.currentTarget.form, {
            method: "post",
          });
        }}
      />
      <ErrorList errors={form.errors} id={fields.description.errorId} />
    </fetcher.Form>
  );
}
