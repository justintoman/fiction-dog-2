import { data, Outlet, redirect } from "react-router";
import { sessionKey } from "~/services/auth.server";
import { authSessionStorage } from "~/services/session.server";
import type { Route } from "./+types/route";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const user = session.get(sessionKey);
  if (user) {
    throw redirect("/");
  }
  return data(null);
}

export default function AuthPage() {
  return (
    <main className="w-full space-y-4 p-4 sm:mx-auto sm:max-w-lg">
      <Outlet />
    </main>
  );
}
