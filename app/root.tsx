import clsx from "clsx";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import type { User } from "~/generated/prisma";
import { ClientHintCheck, getHints } from "~/lib/client-hints";
import { useNonce } from "~/lib/nonce-provider";
import { useTheme } from "~/lib/theme";
import { getTheme } from "~/lib/theme.server";
import { NavBar } from "~/NavBar";
import { getUserId } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: "Fiction Dog",
  },
  {
    name: "description",
    content: "Fiction Dog is a tool for creating and sharing stories.",
  },
  {
    "theme-color":
      data.requestInfo.theme === "dark"
        ? "oklch(0.141 0.005 285.823)"
        : "oklch(1 0 0)",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const nonce = useNonce();
  const theme = useTheme();
  return (
    <html lang="en" className={clsx(theme, "bg-background h-full w-full")}>
      <head>
        <ClientHintCheck nonce={nonce} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full w-full">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await getUserId(request);
  let user: User | null = null;
  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
    });
  }

  return {
    user,
    requestInfo: {
      theme: getTheme(request),
      hints: getHints(request),
    },
  };
}

export default function App({ loaderData: { user } }: Route.ComponentProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <NavBar user={user} />
      <div className="min-h-0 flex-grow">
        <Outlet />
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
