import { invariant } from "@epic-web/invariant";
import type { Password, User, Session } from "@prisma/client";
import { redirect } from "react-router";
import bcrypt from "bcryptjs";
import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { safeRedirect } from "remix-utils/safe-redirect";
import { prisma } from "./prisma.server";
import { authSessionStorage } from "./session.server";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session
export const authenticator = new Authenticator<
  Awaited<ReturnType<typeof login>>
>();

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");
    invariant(typeof email === "string", "Email must be a string");
    invariant(typeof password === "string", "Password must be a string");
    const session = await login({ email, password });
    if (!session) {
      throw new Error("Unable to login");
    }

    return session;
  }),
  "user-pass",
);
/**
 * Combine multiple header objects into one (uses append so headers are not overridden)
 */
export function combineHeaders(
  ...headers: Array<ResponseInit["headers"] | null | undefined>
) {
  const combined = new Headers();
  for (const header of headers) {
    if (!header) continue;
    for (const [key, value] of new Headers(header).entries()) {
      combined.append(key, value);
    }
  }
  return combined;
}

export const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30;
export const getSessionExpirationDate = () =>
  new Date(Date.now() + SESSION_EXPIRATION_TIME);

export const sessionKey = "sessionId";

export async function getUserId(request: Request) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const sessionPartial = authSession.get(sessionKey) as Session | null;
  if (!sessionPartial) return null;
  const session = await prisma.session.findUnique({
    select: { user: { select: { id: true } } },
    where: { id: sessionPartial.id, expirationDate: { gt: new Date() } },
  });
  if (!session?.user) {
    throw redirect("/", {
      headers: {
        "set-cookie": await authSessionStorage.destroySession(authSession),
      },
    });
  }
  return session.user.id;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  let user: User | null = null;
  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
    });
  }
  return user;
}

export async function requireUserId(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {},
) {
  const userId = await getUserId(request);
  if (!userId) {
    const requestUrl = new URL(request.url);
    redirectTo =
      redirectTo === null
        ? null
        : (redirectTo ?? `${requestUrl.pathname}${requestUrl.search}`);
    const loginParams = redirectTo ? new URLSearchParams({ redirectTo }) : null;
    const loginRedirect = ["/login", loginParams?.toString()]
      .filter(Boolean)
      .join("?");
    throw redirect(loginRedirect);
  }
  return userId;
}

export async function requireAnonymous(request: Request) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/");
  }
}

export async function login({
  email,
  password,
}: {
  email: User["email"];
  password: string;
}) {
  const user = await verifyUserPassword({ email }, password);
  if (!user) return null;
  const session = await prisma.session.create({
    select: { id: true, expirationDate: true, userId: true },
    data: {
      expirationDate: getSessionExpirationDate(),
      userId: user.id,
    },
  });
  return session;
}

export async function resetUserPassword({
  email,
  password,
}: {
  email: User["email"];
  password: string;
}) {
  const hashedPassword = await getPasswordHash(password);
  return prisma.user.update({
    where: { email },
    data: {
      password: {
        update: {
          hash: hashedPassword,
        },
      },
    },
  });
}

export async function signup({
  email,
  password,
  name,
}: {
  email: User["email"];
  name: User["name"];
  password: string;
}) {
  const hashedPassword = await getPasswordHash(password);

  const session = await prisma.session.create({
    data: {
      expirationDate: getSessionExpirationDate(),
      user: {
        create: {
          email: email.toLowerCase(),
          name,
          password: {
            create: {
              hash: hashedPassword,
            },
          },
        },
      },
    },
    select: { id: true, expirationDate: true },
  });

  return session;
}

export async function logout(
  {
    request,
    redirectTo = "/",
  }: {
    request: Request;
    redirectTo?: string;
  },
  responseInit?: ResponseInit,
) {
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie"),
  );
  const sessionId = authSession.get(sessionKey);
  // if this fails, we still need to delete the session from the user's browser
  // and it doesn't do any harm staying in the db anyway.
  if (sessionId) {
    // the .catch is important because that's what triggers the query.
    // learn more about PrismaPromise: https://www.prisma.io/docs/orm/reference/prisma-client-reference#prismapromise-behavior
    void prisma.session
      .deleteMany({ where: { id: sessionId } })
      .catch(() => {});
  }
  throw redirect(safeRedirect(redirectTo), {
    ...responseInit,
    headers: combineHeaders(
      { "set-cookie": await authSessionStorage.destroySession(authSession) },
      responseInit?.headers,
    ),
  });
}

export async function getPasswordHash(password: string) {
  const hash = await bcrypt.hash(password, 10);
  return hash;
}

export async function verifyUserPassword(
  where: Pick<User, "email"> | Pick<User, "id">,
  password: Password["hash"],
) {
  const userWithPassword = await prisma.user.findUnique({
    where,
    select: { id: true, password: { select: { hash: true } } },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash,
  );

  if (!isValid) {
    return null;
  }

  return { id: userWithPassword.id };
}
