import { getFormProps, getTextareaProps, useForm } from "@conform-to/react";
import { getZodConstraint } from "@conform-to/zod";
import { Label } from "@radix-ui/react-label";
import { useDebounceFetcher } from "remix-utils/use-debounce-fetcher";
import { ErrorList } from "~/components/ErrorsList";
import { Textarea } from "~/components/ui/textarea";
import { TitleSchema } from "./schemas";

export function StoryTitleEditor({ title }: { title: string }) {
  const fetcher = useDebounceFetcher();
  const [form, fields] = useForm({
    defaultValue: {
      title,
    },
    constraint: getZodConstraint(TitleSchema),
  });
  return (
    <fetcher.Form method="post" {...getFormProps(form)} className="w-full p-1">
      <input name="intent" value="title" type="hidden" />
      <Label className="text-xs" htmlFor={fields.title.id}>
        Story Title
      </Label>
      <Textarea
        {...getTextareaProps(fields.title)}
        rows={3}
        onChange={(event) => {
          event.currentTarget.value = event.currentTarget.value.replace(
            /\n/g,
            "",
          );
          fetcher.submit(event.currentTarget.form, { method: "POST" });
        }}
      />
      <ErrorList errors={form.errors} id={fields.title.errorId} />
    </fetcher.Form>
  );
}
