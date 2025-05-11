import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import ky from "ky";
import { ArrowLeft } from "lucide-react";
import { data, Form, Link, redirect } from "react-router";
import { z } from "zod";
import { Db } from "~/api/db.server";
import { ErrorList } from "~/components/ErrorsList";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ImagePicker } from "~/routes/images/route";
import { getUser } from "~/services/auth.server";
import type { Route } from "./+types/route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return data(submission.reply(), { status: 400 });
  }

  const { title, imageUrl } = submission.value;

  const imageBlob = await ky.get(imageUrl).blob();
  const image = await Db.Image.create(imageBlob);

  const story = await Db.Story.create({
    title,
    authorId: user.id,
    imageId: image.id,
  });

  return redirect(`/create/${story.slug}/${story.firstChapterId}`);
}

export default function CreateStory({ actionData }: Route.ComponentProps) {
  const [form, fields] = useForm({
    defaultValue: {
      title: "",
      imageUrl: "",
    },
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    constraint: getZodConstraint(schema),
  });
  return (
    <main className="mx-auto flex h-full w-full flex-col sm:max-w-3xl">
      <div className="mb-4 flex items-center justify-between px-4 py-2">
        <h1 className="font-bold">Create a Story</h1>
        <Button asChild variant="link">
          <Link to="/">
            <ArrowLeft />
            Back
          </Link>
        </Button>
      </div>
      <Form
        className="flex justify-between space-x-4 px-4 py-2"
        method="post"
        {...getFormProps(form)}
      >
        <div className="space-y-2">
          <Label className="text-sm font-bold" htmlFor={fields.title.id}>
            Title
          </Label>
          <Input
            {...getInputProps(fields.title, { type: "text" })}
            placeholder="Title"
            className="w-full"
          />
          <ErrorList id={fields.title.errorId} errors={fields.title.errors} />
        </div>
        <Button>Create</Button>
      </Form>
      <div className="min-h-0 flex-grow">
        <ImagePicker config={fields.imageUrl} />
      </div>
    </main>
  );
}

const schema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters long")
    .max(100),
  imageUrl: z.string().min(1, "Image is required").url(),
});

export const meta: Route.MetaFunction = () => [
  {
    title: "Create a Story | Fiction Dog",
  },
];
