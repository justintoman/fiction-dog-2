import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { ThemeProvider } from "~/components/ThemeProvider";
import type { User } from "@prisma/client";
import { getUserId } from "~/services/auth.server";
import { prisma } from "~/services/prisma.server";
import { Button } from "~/components/ui/button";

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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background h-full w-full">
      <head>
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
  console.log("root loader", { userId, user });
  return { user };
}

export default function App({ loaderData: { user } }: Route.ComponentProps) {
  return (
    <ThemeProvider>
      <div className="h-full w-full flex flex-col">
        <NavBar user={user} />
        <div className="flex-grow min-h-0">
          <Outlet />
        </div>
      </div>
    </ThemeProvider>
  );
}

function NavBar({ user }: { user: User | null }) {
  return (
    <nav className="w-full p-4 border-b-1 border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-lg font-bold">Fiction Dog 🐶🪄</span>
        </div>
        <div className="flex items-center">
          {user ? (
            <div className="flex items-center">
              <span className="text-sm font-medium">{user.name}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link to="/login">Login</Link>
              </Button>

              <Button asChild variant="outline">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
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
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
