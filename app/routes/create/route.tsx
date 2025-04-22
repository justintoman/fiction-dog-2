import { invariant } from "@epic-web/invariant";
import ky from "ky";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Form, Link, redirect } from "react-router";
import sharp from "sharp";
import { Db } from "~/api/db";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ImagePicker } from "~/routes/images/route";
import { getUser } from "~/services/auth.server";
import type { BingSearchValue } from "~/types";
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

  const title = formData.get("title");
  invariant(title, "Title is required");
  invariant(typeof title === "string", "Title must be a string");

  const imageUrl = formData.get("image");
  invariant(imageUrl, "Image is required");
  invariant(typeof imageUrl === "string", "Image must be a string");

  const imageBlob = await ky.get(imageUrl).blob();
  const imageSource = sharp(await imageBlob.arrayBuffer()).resize({
    width: 800,
    height: 450,
  });
  const image = await Db.Image.create({
    source: await imageSource.toBuffer(),
    webp: await imageSource.webp().toBuffer(),
    png: await imageSource.png().toBuffer(),
  });

  const story = await Db.Story.create({
    title,
    authorId: user.id,
    imageId: image.id,
  });

  return redirect(`/create/${story.slug}/${story.firstChapterId}`);
}

export default function CreateStory() {
  const [image, setImage] = useState<BingSearchValue | null>(null);
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
      <Form className="flex justify-between space-x-4 px-4 py-2" method="post">
        <div className="space-y-2">
          <Label className="text-sm font-bold" htmlFor="title">
            Title
          </Label>
          <Input
            type="text"
            placeholder="Title"
            id="title"
            className="w-full"
          />
        </div>
        <input type="hidden" name="image" value={image?.contentUrl} />
        <Button>Create</Button>
      </Form>
      <div className="min-h-0 flex-grow">
        <ImagePicker image={image?.thumbnailUrl} onChange={setImage} />
      </div>
    </main>
  );
}
