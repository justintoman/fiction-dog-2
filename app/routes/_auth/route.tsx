import { data, redirect } from "react-router";
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
