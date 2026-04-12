import * as React from "react";
import { MenuIcon, XIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { UserContext } from "@/src/app/UserContext.jsx";

const MOBILE_DRAWER_ID = "mobile-main-nav-drawer";

function HealthIsWealthWordmark({ className }) {
  return (
    <span className={className}>
      <span className="font-['Outfit',sans-serif] font-extrabold tracking-[-0.04em] text-foreground">
        Health is{" "}
      </span>
      <span className="font-['Outfit',sans-serif] font-extrabold tracking-[-0.04em] text-[#006d77]">
        Wealth.
      </span>
    </span>
  );
}

function mobileNavRowClass({ isActive }) {
  return cn(
    "flex min-h-10 w-full items-center rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted",
    isActive && "bg-muted",
  );
}

function MobileNavItems({ user, onNavigate, onSignOut }) {
  return (
    <nav className="flex flex-col gap-1 px-2 pb-4" aria-label="Main">
      <NavLink to="/" className={mobileNavRowClass} onClick={onNavigate} end>
        <HealthIsWealthWordmark />
      </NavLink>
      {user ? (
        <>
          <NavLink
            to="/training"
            className={mobileNavRowClass}
            onClick={onNavigate}
          >
            My Training
          </NavLink>
          <p className="mt-2 px-3 text-xs font-medium tracking-wide text-muted-foreground">
            Explore
          </p>
          <NavLink
            to="/explore/exercises"
            className={({ isActive }) =>
              cn(mobileNavRowClass({ isActive }), "pl-6")
            }
            onClick={onNavigate}
          >
            Exercises
          </NavLink>
          <NavLink
            to="/explore/templates"
            className={({ isActive }) =>
              cn(mobileNavRowClass({ isActive }), "pl-6")
            }
            onClick={onNavigate}
          >
            Templates
          </NavLink>
          <NavLink
            to="/explore/plans"
            className={({ isActive }) =>
              cn(mobileNavRowClass({ isActive }), "pl-6")
            }
            onClick={onNavigate}
          >
            Plans
          </NavLink>
          <NavLink
            to="/profile"
            className={mobileNavRowClass}
            onClick={onNavigate}
          >
            Profile
          </NavLink>
          <button
            type="button"
            className={cn(mobileNavRowClass({ isActive: false }), "text-left")}
            onClick={() => {
              onNavigate();
              onSignOut();
            }}
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <NavLink
            to="/sign-in"
            className={mobileNavRowClass}
            onClick={onNavigate}
          >
            Sign In
          </NavLink>
          <NavLink
            to="/sign-up"
            className={mobileNavRowClass}
            onClick={onNavigate}
          >
            Sign Up
          </NavLink>
        </>
      )}
    </nav>
  );
}

export default function NavBar() {
  const { user, setUser } = React.useContext(UserContext);
  const location = useLocation();
  const pathname = location.pathname;
  const [open, setOpen] = React.useState(false);

  const handleSignOut = React.useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, [setUser]);

  const closeDrawer = React.useCallback(() => {
    setOpen(false);
  }, []);

  React.useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header className="sticky top-0 z-[60] w-full border-b border-foreground/10 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/70">
      <div className="flex w-full max-w-[600px] flex-col">
        <div className="flex h-16 justify-between px-6 md:hidden">
          <NavLink
            to="/"
            className="font-heading text-lg font-bold tracking-tight text-foreground no-underline"
          >
            <HealthIsWealthWordmark />
          </NavLink>
          <Drawer
            direction="top"
            open={open}
            onOpenChange={setOpen}
            repositionInputs={false}
          >
            <DrawerTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-expanded={open}
                aria-controls={MOBILE_DRAWER_ID}
                aria-label={open ? "Close menu" : "Open menu"}
              >
                {open ? "" : <MenuIcon className="size-5" aria-hidden />}
              </Button>
            </DrawerTrigger>
            <DrawerContent
              id={MOBILE_DRAWER_ID}
              className="max-h-[calc(100vh-4rem)] !top-10"
            >
              <DrawerHeader className="text-left">
                <DrawerTitle className="text-left sr-only">
                  Main menu
                </DrawerTitle>
                <DrawerClose asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 ml-auto"
                  >
                    <XIcon className="size-5" aria-hidden />
                  </Button>
                </DrawerClose>

                <DrawerDescription className="sr-only">
                  Site navigation links and account actions
                </DrawerDescription>
              </DrawerHeader>
              <MobileNavItems
                user={user}
                onNavigate={closeDrawer}
                onSignOut={handleSignOut}
              />
            </DrawerContent>
          </Drawer>
        </div>

        <div className="hidden py-3 md:flex md:min-h-16 ">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  asChild
                  active={pathname === "/"}
                  className={navigationMenuTriggerStyle()}
                >
                  <NavLink to="/" className={navigationMenuTriggerStyle()} end>
                    <HealthIsWealthWordmark />
                  </NavLink>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {user ? (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      active={pathname === "/training"}
                      className={navigationMenuTriggerStyle()}
                    >
                      <NavLink
                        to="/training"
                        className={navigationMenuTriggerStyle()}
                      >
                        My Training
                      </NavLink>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger
                      className={
                        pathname.startsWith("/explore")
                          ? "bg-muted/50 data-[popup-open]:bg-muted/50"
                          : undefined
                      }
                    >
                      Explore
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="w-56 space-y-1 p-2">
                        <NavigationMenuItem>
                          <NavigationMenuLink
                            asChild
                            active={pathname === "/explore/exercises"}
                            className="w-full"
                          >
                            <NavLink to="/explore/exercises">Exercises</NavLink>
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                          <NavigationMenuLink
                            asChild
                            active={pathname === "/explore/templates"}
                            className="w-full"
                          >
                            <NavLink to="/explore/templates">Templates</NavLink>
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                          <NavigationMenuLink
                            asChild
                            active={pathname === "/explore/plans"}
                            className="w-full"
                          >
                            <NavLink to="/explore/plans">Plans</NavLink>
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      active={pathname === "/profile"}
                      className={navigationMenuTriggerStyle()}
                    >
                      <NavLink
                        to="/profile"
                        className={navigationMenuTriggerStyle()}
                      >
                        Profile
                      </NavLink>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      className={navigationMenuTriggerStyle()}
                    >
                      <button
                        type="button"
                        className={navigationMenuTriggerStyle()}
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </button>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              ) : (
                <>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      active={pathname === "/sign-in"}
                      className={navigationMenuTriggerStyle()}
                    >
                      <NavLink
                        to="/sign-in"
                        className={navigationMenuTriggerStyle()}
                      >
                        Sign In
                      </NavLink>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      asChild
                      active={pathname === "/sign-up"}
                      className={navigationMenuTriggerStyle()}
                    >
                      <NavLink
                        to="/sign-up"
                        className={navigationMenuTriggerStyle()}
                      >
                        Sign Up
                      </NavLink>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
}
