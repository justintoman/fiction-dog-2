import type { User } from "@prisma/client";
import { Menu } from "lucide-react";
import {
  Form,
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { ThemeProvider } from "~/components/ThemeProvider";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
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

  return { user };
}

export default function App({ loaderData: { user } }: Route.ComponentProps) {
  return (
    <ThemeProvider>
      <div className="flex h-full w-full flex-col">
        <NavBar user={user} />
        <div className="min-h-0 flex-grow">
          <Outlet />
        </div>
      </div>
    </ThemeProvider>
  );
}

function NavBar({ user }: { user: User | null }) {
  return (
    <nav className="w-full border-b-1 border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-lg font-bold">
            <Link to="/">🐶🪄 Fiction Dog</Link>
          </span>
        </div>
        <div className="flex items-center">
          {user ? (
            <>
              <div className="hidden space-x-2 sm:flex">
                <Button variant="link" size="sm" asChild>
                  <Link to="/create">Create a Story</Link>
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      {user.name}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-fit">
                    <ul>
                      <li>
                        <Button variant="ghost" asChild>
                          <Link to="/account">Account</Link>
                        </Button>
                      </li>
                      <li>
                        <Form method="post" action="/logout">
                          <Button type="submit" variant="ghost">
                            Logout
                          </Button>
                        </Form>
                      </li>
                    </ul>
                  </PopoverContent>
                </Popover>
              </div>
              <Drawer>
                <DrawerTrigger className="flex sm:hidden" asChild>
                  <Button variant="outline" size="icon">
                    <Menu className="h-4 w-4" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader className="flex justify-center text-center">
                    <DrawerTitle>{user.name}</DrawerTitle>
                    <div className="border-b-1 py-2" />
                  </DrawerHeader>
                  <DrawerClose asChild>
                    <Button variant="link" size="sm" asChild>
                      <Link to="/create">Create a Story</Link>
                    </Button>
                  </DrawerClose>

                  <DrawerClose asChild>
                    <Button variant="link" size="sm" asChild>
                      <Link to="/account">Account</Link>
                    </Button>
                  </DrawerClose>
                  <DrawerClose>
                    <Form method="post" action="/logout">
                      <Button type="submit" variant="ghost">
                        Logout
                      </Button>
                    </Form>
                  </DrawerClose>

                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="link">Close</Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </>
          ) : (
            <div className="flex items-center">
              <Button asChild variant="link" size="sm">
                <Link to="/login">Login</Link>
              </Button>

              <Button asChild variant="link" size="sm">
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
