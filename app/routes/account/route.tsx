import { redirect } from "react-router";
import { getUser } from "~/services/auth.server";
import type { Route } from "./+types/route";

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUser(request);
  if (!user) {
    return redirect("/login");
  }

  return { user };
}

export default function AccountPage({
  loaderData: { user },
}: Route.ComponentProps) {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl">Welcome, {user.name}</h1>
    </main>
  );
}
