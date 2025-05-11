import clsx from "clsx";
import { LaptopIcon, Menu, MoonIcon, SunIcon, X } from "lucide-react";
import { Form, Link, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
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
import type { User } from "~/generated/prisma";
import { useRequestInfo } from "~/lib/request-info";
import { THEME_FETCHER_KEY, useOptimisticThemeMode } from "~/lib/theme";

export function NavBar({ user }: { user: User | null }) {
  return (
    <nav className="w-full border-b-1 border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-lg font-bold">
            <Link to="/">🐶🪄 Fiction Dog</Link>
          </span>
          <span className="ml-8 hidden h-fit sm:inline">
            <DarkModeToggle />
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
              <MobileMenu user={user} />
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

function MobileMenu({ user }: { user: User }) {
  return (
    <Drawer>
      <DrawerTrigger className="flex sm:hidden" asChild>
        <Button variant="outline" size="icon">
          <Menu className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="flex justify-center text-center">
          <DrawerTitle>{user.name}</DrawerTitle>
          <DrawerDescription className="sr-only">User Menu</DrawerDescription>
          <div className="border-b-1 py-2" />
          <DarkModeToggle variant="labelled" />
          <DrawerClose asChild>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-0 right-0 m-2"
            >
              <X />
            </Button>
          </DrawerClose>
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

        <DrawerFooter>
          <DrawerClose asChild>
            <Form
              method="post"
              action="/logout"
              className="flex w-full justify-center"
            >
              <Button type="submit" variant="ghost">
                Logout
              </Button>
            </Form>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

const iconTransformOrigin = { transformOrigin: "50% 100px" };
function DarkModeToggle({
  variant = "icon",
}: {
  variant?: "icon" | "labelled";
}) {
  const requestInfo = useRequestInfo();
  const fetcher = useFetcher({ key: THEME_FETCHER_KEY });

  const optimisticMode = useOptimisticThemeMode();
  const mode = optimisticMode ?? requestInfo.theme ?? "system";
  const nextMode =
    mode === "system" ? "light" : mode === "light" ? "dark" : "system";

  const iconSpanClassName =
    "absolute size-full inset-0 flex items-center justify-center transition-transform duration-700 motion-reduce:duration-[0s]";
  return (
    <fetcher.Form
      method="POST"
      action="/action/set-theme"
      className="flex items-center"
    >
      <input type="hidden" name="theme" value={nextMode} />

      <Button
        type="submit"
        variant="outline"
        size={variant === "icon" ? "icon" : "default"}
        className="inline-flex items-center justify-center overflow-hidden"
      >
        {/* note that the duration is longer then the one on body, controlling the bg-color */}
        <div className="relative size-full">
          <span
            className={clsx(
              iconSpanClassName,
              mode === "dark" ? "rotate-0" : "rotate-90",
            )}
            style={iconTransformOrigin}
          >
            <MoonIcon />
          </span>
          <span
            className={clsx(
              iconSpanClassName,
              mode === "light" ? "rotate-0" : "-rotate-90",
            )}
            style={iconTransformOrigin}
          >
            <SunIcon />
          </span>

          <span
            className={clsx(
              iconSpanClassName,
              mode === "system" ? "translate-y-0" : "translate-y-10",
            )}
            style={iconTransformOrigin}
          >
            <LaptopIcon />
          </span>
        </div>
        <span className={clsx("ml-4", { "sr-only": variant === "icon" })}>
          {`Switch to ${
            nextMode === "system"
              ? "system"
              : nextMode === "light"
                ? "light"
                : "dark"
          } mode`}
        </span>
      </Button>
    </fetcher.Form>
  );
}
