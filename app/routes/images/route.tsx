import { getInputProps, type FieldMetadata } from "@conform-to/react";
import { ArrowLeft, Image as ImageIcon, Search } from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import { Bing } from "~/api/bing";
import { ErrorList } from "~/components/ErrorsList";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import type { Route } from "./+types/route";

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
  config: FieldMetadata;
};

export function ImagePicker({ config }: ImageSearchProps) {
  const [isEditing, setIsEditing] = useState(false);
  const fetcher = useFetcher<typeof loader>();
  const [value, setValue] = useState("");

  if (isEditing) {
    return (
      <div className="flex h-full min-h-0 flex-col-reverse sm:flex-col">
        <fetcher.Form
          method="get"
          action="/images"
          className="my-2 flex w-full items-center space-x-2 px-2 sm:p-0"
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
                    setValue(image.contentUrl);
                    setIsEditing(false);
                  }}
                  className="cursor-pointer p-1 transition-transform hover:brightness-105 sm:basis-1/2"
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
    <div className="mx-auto h-72 w-full sm:h-96 sm:w-xl">
      <div
        data-has-image={Boolean(value)}
        aria-invalid={Boolean(config.errors?.length)}
        className="border-muted-foreground group aria-invalid:border-destructive-foreground my-2 grid h-full w-full grid-cols-1 grid-rows-1 rounded-md border-dashed data-[has-image=false]:border-2"
      >
        <picture className="col-1 row-1 flex h-full w-full items-center justify-center">
          <img
            src={value}
            className="max-h-full max-w-full group-data-[has-image=false]:hidden"
          />
          <source
            srcSet={value}
            className="max-h-full max-w-full group-data-[has-image=false]:hidden"
          />
          <span className="text-muted-foreground text-center text-sm italic group-data-[has-image=true]:hidden">
            <ImageIcon />
          </span>
        </picture>
        <input
          {...getInputProps(config, { type: "hidden" })}
          value={value}
          form={config.formId}
        />
        <div className="col-1 row-1 flex items-end justify-end p-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Pick a new photo
            <Search />
          </Button>
        </div>
      </div>
      <ErrorList id={config.errorId} errors={config.errors} />
    </div>
  );
}
