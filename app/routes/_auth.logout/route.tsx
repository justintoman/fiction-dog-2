import type { Route } from ".react-router/types/app/+types/root";
import { logout } from "~/services/auth.server";

export async function action({ request }: Route.ActionArgs) {
  return logout({ request });
}
