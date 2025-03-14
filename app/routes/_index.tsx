import { Link } from "react-router";
import { Button } from "~/components/ui/button";

export default function Welcome() {
  return (
    <main className="pt-16 pb-4">
      <div className="flex justify-between px-8">
        <h1 className="text-2xl font-bold">Fiction Dog</h1>
        <Button asChild>
          <Link to="/create">Create a Story</Link>
        </Button>
      </div>
    </main>
  );
}
