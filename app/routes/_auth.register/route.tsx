import { data, Form, redirect } from "react-router";
import { sessionKey, signup } from "~/services/auth.server";
import type { Route } from "./+types/route";
import { getFormProps, useForm, getInputProps } from "@conform-to/react";
import { authSessionStorage } from "~/services/session.server";
import { Input } from "~/components/ui/input";
import { parseWithZod, getZodConstraint } from "@conform-to/zod";
import { z } from "zod";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

export default function SignUpPage({ actionData }: Route.ComponentProps) {
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

      <Label htmlFor={fields.name.id}>Display Name</Label>
      <Input {...getInputProps(fields.name, { type: "text" })} />

      <Label htmlFor={fields.password.id}>Password</Label>
      <Input
        {...getInputProps(fields.password, { type: "password" })}
        autoComplete="current-password"
      />
      <Button type="submit">Sign Up</Button>
    </Form>
  );
}

export async function action({ request }: Route.ActionArgs) {
  console.log("signup attempted");
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const session = await signup({
    email: submission.value.email,
    name: submission.value.name,
    password: submission.value.password,
  });
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  authSession.set(sessionKey, session);

  throw redirect("/", {
    headers: {
      "Set-Cookie": await authSessionStorage.commitSession(authSession),
    },
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const user = session.get("user");
  if (user) throw redirect("/dashboard");
  return data(null);
}

const schema = z
  .object({
    email: z.string().email(),
    name: z.string().min(1),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword", "password"],
  });
