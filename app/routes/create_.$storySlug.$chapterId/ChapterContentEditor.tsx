import { getFormProps, getTextareaProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useFetcher } from "react-router";
import { ErrorList } from "~/components/ErrorsList";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { ChapterDescriptionSchema } from "./schemas";

export function ChapterContentEditor({ description }: { description: string }) {
  const fetcher = useFetcher();
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
      <Label className="text-xs" htmlFor={fields.description.id}>
        Chapter Content
      </Label>
      <Textarea {...getTextareaProps(fields.description)} rows={10} />
      <ErrorList errors={form.errors} id={fields.description.errorId} />
    </fetcher.Form>
  );
}
