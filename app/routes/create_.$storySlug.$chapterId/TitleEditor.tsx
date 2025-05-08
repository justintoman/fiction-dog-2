import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint } from "@conform-to/zod";
import { Label } from "@radix-ui/react-label";
import { useDebounceFetcher } from "remix-utils/use-debounce-fetcher";
import { Input } from "~/components/ui/input";
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
    <fetcher.Form method="post" {...getFormProps(form)}>
      <input name="intent" value="title" type="hidden" />
      <Label htmlFor={fields.title.id}>Story Title</Label>
      <Input
        {...getInputProps(fields.title, { type: "text" })}
        onChange={(event) => {
          fetcher.submit(event.currentTarget.form, { method: "POST" });
        }}
      />
    </fetcher.Form>
  );
}
