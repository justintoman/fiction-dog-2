import { parseWithZod } from "@conform-to/zod";
import { data } from "react-router";
import { ThemeFormSchema } from "~/lib/theme";
import { setTheme } from "~/lib/theme.server";
import type { Route } from "./+types/route";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: ThemeFormSchema,
  });
  if (submission.status !== "success") {
    return data(
      { result: submission.reply() },
      { status: submission.status === "error" ? 400 : 200 },
    );
  }
  const { theme } = submission.value;

  const responseInit = {
    headers: { "set-cookie": setTheme(theme) },
  };
  return data({ success: true, submission }, responseInit);
}
