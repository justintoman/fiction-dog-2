import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint } from "@conform-to/zod";
import { useFetcher } from "react-router";
import { Label } from "~/components/ui/label";
import { ChapterImageSchema } from "~/routes/create_.$storySlug.$chapterId/schemas";
import { ImagePicker } from "~/routes/images/route";

export function ChapterImagePicker({ imageId }: { imageId: string }) {
  const fetcher = useFetcher();
  const [form, fields] = useForm({
    defaultValue: {
      imageId,
    },
    constraint: getZodConstraint(ChapterImageSchema),
  });
  return (
    <fetcher.Form method="post" {...getFormProps(form)}>
      <input name="intent" value="chapter-image" type="hidden" />
      <Label htmlFor={fields.imageId.id}>Chapter Image</Label>
      <ImagePicker config={fields.imageId} />
    </fetcher.Form>
  );
}
