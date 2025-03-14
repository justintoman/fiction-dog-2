import { Form, redirect } from "react-router";
import { authenticator, sessionKey } from "~/services/auth.server";
import type { Route } from "./+types/route";
import { getFormProps, useForm, getInputProps } from "@conform-to/react";
import { authSessionStorage } from "~/services/session.server";
import { Input } from "~/components/ui/input";
import { parseWithZod, getZodConstraint } from "@conform-to/zod";
import { z } from "zod";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

export default function LoginPage({ actionData }: Route.ComponentProps) {
  const [form, fields] = useForm({
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    constraint: getZodConstraint(schema),
  });
  return (
    <Form method="post" {...getFormProps(form)}>
      <Label htmlFor={fields.email.id}>Email</Label>
      <Input {...getInputProps(fields.email, { type: "email" })} />

      <Label htmlFor={fields.password.id}>Password</Label>
      <Input
        {...getInputProps(fields.password, { type: "password" })}
        autoComplete="current-password"
      />
      <Button>Sign In</Button>
    </Form>
  );
}

export async function action({ request }: Route.ActionArgs) {
  // we call the method with the name of the strategy we want to use and the
  // request object
  const userSession = await authenticator.authenticate("user-pass", request);

  const session = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  session.set(sessionKey, userSession);

  throw redirect("/", {
    headers: { "Set-Cookie": await authSessionStorage.commitSession(session) },
  });
}

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
});
