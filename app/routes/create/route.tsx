import { useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { ImagePicker } from "~/routes/images/route";
import type { BingSearchValue } from "~/types";

export default function CreateStory() {
  const [image, setImage] = useState<BingSearchValue | null>(null);
  return (
    <main className="w-full h-full sm:max-w-3xl mx-auto flex flex-col">
      <div className="flex justify-between px-4 py-2 sm:pt-8 items-center mb-4">
        <h1 className="text-2xl font-bold">Create a Story</h1>
        <Button asChild>
          <Link to="/">Back</Link>
        </Button>
      </div>
      <div className="flex-grow min-h-0">
        <ImagePicker image={image?.thumbnailUrl} onChange={setImage} />
      </div>
    </main>
  );
}
