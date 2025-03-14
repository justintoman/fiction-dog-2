import { Bing } from "~/api/bing";
import type { Route } from "./+types/route";
import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { BingSearchValue } from "~/types";
import { useState } from "react";
import { ArrowLeft, Image, Search } from "lucide-react";
import { ScrollArea } from "~/components/ui/scroll-area";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const query = params.get("q");
  if (!query) {
    return null;
  }
  const results = Bing.imageSearch(query || "");
  return results;
}

type ImageSearchProps = {
  image?: string;
  onChange(value: BingSearchValue): void;
};

export function ImagePicker({ image, onChange }: ImageSearchProps) {
  const [isEditing, setIsEditing] = useState(false);
  const fetcher = useFetcher<typeof loader>();

  if (isEditing) {
    return (
      <div className="flex flex-col-reverse sm:flex-col min-h-0 h-full">
        <fetcher.Form
          method="get"
          action="/images"
          className="flex w-full px-2 sm:p-0 items-center space-x-2 my-2"
        >
          <Button
            size="icon"
            variant="outline"
            onClick={() => setIsEditing(false)}
            type="button"
          >
            <ArrowLeft />
          </Button>
          <Input type="search" name="q" placeholder="Search..." />
          <Button type="submit" size="icon" variant="outline">
            <Search />
          </Button>
        </fetcher.Form>

        {fetcher.data && (
          <ScrollArea className="flex-grow overflow-y-auto">
            <ul className="flex flex-wrap">
              {fetcher.data.value.map((image) => (
                <li
                  key={image.imageId}
                  onClick={() => {
                    onChange(image);
                    setIsEditing(false);
                  }}
                  className="sm:basis-1/2 p-1 hover:brightness-105 transition-transform cursor-pointer"
                >
                  <img src={image.thumbnailUrl} />
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </div>
    );
  }

  return (
    <div
      data-has-image={Boolean(image)}
      className="w-full sm:w-xl h-72 sm:h-96 mx-auto rounded-md data-[has-image=false]:border-2 border-dashed border-muted-foreground grid grid-cols-1 grid-rows-1 group"
    >
      <picture className="row-1 col-1 flex items-center justify-center h-full w-full">
        <img
          src={image}
          className="max-h-full max-w-full group-data-[has-image=false]:hidden"
        />
        <source
          srcSet={image}
          className="max-h-full max-w-full group-data-[has-image=false]:hidden"
        />
        <span className="group-data-[has-image=true]:hidden text-sm italic text-center text-muted-foreground">
          <Image />
        </span>
      </picture>
      <div className="row-1 col-1 flex items-end justify-end p-2">
        <Button variant="outline" onClick={() => setIsEditing(true)}>
          Pick a new photo
          <Search />
        </Button>
      </div>
    </div>
  );
}
