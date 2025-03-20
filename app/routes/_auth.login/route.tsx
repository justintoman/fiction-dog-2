import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { Form, redirect } from "react-router";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { authenticator, sessionKey } from "~/services/auth.server";
import { authSessionStorage } from "~/services/session.server";
import type { Route } from "./+types/route";

export default function LoginPage({ actionData }: Route.ComponentProps) {
  const [form, fields] = useForm({
    defaultValue: {
      email: "superpizza@email.com",
      password: "1234qwer",
    },
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    constraint: getZodConstraint(schema),
  });
  return (
    <Form method="post" {...getFormProps(form)} className="w-full space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-bold" htmlFor={fields.email.id}>
          Email
        </Label>
        <Input {...getInputProps(fields.email, { type: "email" })} />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-bold" htmlFor={fields.password.id}>
          Password
        </Label>
        <Input
          {...getInputProps(fields.password, { type: "password" })}
          autoComplete="current-password"
        />
      </div>
      <div className="flex justify-end">
        <Button>Sign In</Button>
      </div>
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
