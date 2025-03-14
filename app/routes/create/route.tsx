import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Form, Link, redirect } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { ImagePicker } from "~/routes/images/route";
import type { BingSearchValue } from "~/types";
import type { Route } from "./+types/route";
import { invariant } from "@epic-web/invariant";
import ky from "ky";
import sharp from "sharp";
import { prisma } from "~/services/prisma.server";
import { getUser } from "~/services/auth.server";
import slugify from "slugify";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (!user) {
    console.log("/create loader, no user found", user);
    return redirect("/login");
  }
}

export async function action({ request }: Route.ActionArgs) {
  const user = await getUser(request);
  if (!user) {
    console.log("/create action, no user found", user);
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
  const image = await prisma.image.create({
    data: {
      source: await imageSource.toBuffer(),
      webp: await imageSource.webp().toBuffer(),
      png: await imageSource.png().toBuffer(),
    },
  });

  const slug = slugify(title.substring(0, 50), {
    lower: true,
    strict: true,
  });

  const story = await prisma.story.create({
    data: {
      slug,
      title,
      authorId: user.id,
      imageId: image.id,
    },
  });

  const firstChapter = await prisma.chapter.create({
    data: {
      storySlug: story.slug,
      content: "",
      imageId: image.id,
    },
  });

  await prisma.story.update({
    where: {
      slug: story.slug,
    },
    data: {
      firstChapterId: firstChapter.id,
    },
  });

  console.log("created a bunch of stuff");
  console.log({ story, firstChapter, image });

  return redirect(`/create/${story.slug}/${firstChapter.id}`);
}

export default function CreateStory() {
  const [image, setImage] = useState<BingSearchValue | null>(null);
  return (
    <main className="w-full h-full sm:max-w-3xl mx-auto flex flex-col">
      <div className="flex justify-between px-4 py-2 items-center mb-4">
        <h1 className="font-bold">Create a Story</h1>
        <Button asChild variant="link">
          <Link to="/">
            <ArrowLeft />
            Back
          </Link>
        </Button>
      </div>
      <Form className="flex justify-between px-4 py-2 space-x-4" method="post">
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
      <div className="flex-grow min-h-0">
        <ImagePicker image={image?.thumbnailUrl} onChange={setImage} />
      </div>
    </main>
  );
}
