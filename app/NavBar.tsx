import type { User } from "@prisma/client";
import { Menu, X } from "lucide-react";
import { Form, Link } from "react-router";
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

export function NavBar({ user }: { user: User | null }) {
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
                    <DrawerDescription className="sr-only">
                      User Menu
                    </DrawerDescription>
                    <div className="border-b-1 py-2" />
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
