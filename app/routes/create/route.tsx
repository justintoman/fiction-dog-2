import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export default function CreateStory() {
  return (
    <main className="pt-16 p-4 container mx-auto">
      <Button asChild>
        <Link to="/">Back</Link>
      </Button>
      <h1 className="text-2xl font-bold">Create a Story</h1>
    </main>
  );
}
