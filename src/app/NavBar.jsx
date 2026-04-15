import * as React from "react";
import { cva } from "class-variance-authority";
import { ChevronDownIcon, MenuIcon, XIcon } from "lucide-react";
import { NavLink, useLocation, useMatch } from "react-router";
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
import { UserContext } from "@/src/app/UserContext.jsx";

const MOBILE_DRAWER_ID = "mobile-main-nav-drawer";
const EXPLORE_DESKTOP_MENU_ID = "explore-desktop-menu";

/** Focus ring: bright teal on dark hero surface */
const navFocusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#2dd4bf]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050a12]";

/**
 * Desktop top-level nav — dark hero palette: slate text, bright-teal hover/active (landing-hero).
 */
const desktopNavItem = cva(
  [
    "inline-flex h-9 w-max max-w-full shrink-0 items-center justify-center rounded-md border-b-2 border-transparent bg-transparent px-3 py-2 text-sm font-medium text-[#f8fafc]/85 transition-all duration-200",
    navFocusRing,
  ],
  {
    variants: {
      active: {
        true: "border-[#2dd4bf] bg-[#0c4a52]/55 font-semibold text-[#f8fafc] shadow-[0_1px_0_0_rgba(45,212,191,0.45),inset_0_0_0_1px_rgba(45,212,191,0.2)]",
        false:
          "hover:bg-white/10 hover:text-[#2dd4bf] hover:shadow-[inset_0_0_0_1px_rgba(45,212,191,0.25)]",
      },
    },
    defaultVariants: { active: false },
  },
);

/**
 * Explore desktop trigger: matches `desktopNavItem`; open = stronger mid-teal wash (hero band).
 */
function exploreDesktopTriggerClass(exploreActive, menuOpen) {
  return cn(
    desktopNavItem({ active: exploreActive }),
    "inline-flex items-center gap-1",
    menuOpen &&
      "!border-[#2dd4bf] !bg-[#0c4a52]/80 !font-semibold !text-[#f8fafc] !shadow-[inset_0_0_0_1px_rgba(45,212,191,0.35)]",
  );
}

/**
 * Mobile drawer rows — same hero hierarchy on dark drawer surface.
 */
const mobileNavItem = cva(
  [
    "flex min-h-10 w-full items-center rounded-lg border-l-4 border-transparent px-3 py-2.5 text-sm font-medium text-[#f8fafc]/85 transition-all duration-200",
    navFocusRing,
  ],
  {
    variants: {
      active: {
        true: "border-[#2dd4bf] bg-[#0c4a52]/45 pl-[10px] font-semibold text-[#f8fafc]",
        false: "hover:bg-white/10 hover:text-[#2dd4bf]",
      },
    },
    defaultVariants: { active: false },
  },
);

/**
 * Explore dropdown rows — dark panel; bright teal on hover/active like hero CTA language.
 */
const exploreDropdownItem = cva(
  [
    "flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
    navFocusRing,
  ],
  {
    variants: {
      active: {
        true: "bg-[#006d77]/35 font-semibold text-[#2dd4bf] ring-1 ring-[#2dd4bf]/40",
        false: "text-[#f8fafc]/90 hover:bg-white/10 hover:text-[#2dd4bf]",
      },
    },
    defaultVariants: { active: false },
  },
);

/** Logo / home — Outfit; matches hero h1 + accent span */
function HealthIsWealthWordmark({ className }) {
  return (
    <span className={className}>
      <span className="font-['Outfit',sans-serif] font-extrabold tracking-[-0.04em] text-[#f8fafc]">
        Health is{" "}
      </span>
      <span className="font-['Outfit',sans-serif] font-extrabold tracking-[-0.04em] text-[#2dd4bf]">
        Wealth.
      </span>
    </span>
  );
}

/**
 * Sticky shell: matte gradient with a visible mid-teal band (reads on light pages + landing).
 */
const navShellHeaderClass =
  "sticky top-0 z-[40] w-full border-b border-[#2dd4bf]/35 bg-gradient-to-br from-[#030709] from-0% via-[#155a63] via-[42%] to-[#050c12] to-100% shadow-[0_4px_24px_rgba(0,0,0,0.5)]";

const navShellDrawerClass =
  "max-h-[calc(100vh-4rem)] !top-10 border-b border-[#2dd4bf]/35 bg-gradient-to-b from-[#030709] from-0% via-[#155a63] via-[45%] to-[#050c12] to-100%";

/** Mobile drawer: same nav item recipe as desktop, with stacked layout. */
function MobileNavItems({ user, onNavigate, onSignOut }) {
  return (
    <nav className="flex flex-col gap-1 px-2 pb-4" aria-label="Main">
      <NavLink
        to="/"
        className={({ isActive }) => mobileNavItem({ active: isActive })}
        onClick={onNavigate}
        end
      >
        <HealthIsWealthWordmark />
      </NavLink>
      {user ? (
        <>
          <NavLink
            to="/training"
            className={({ isActive }) => mobileNavItem({ active: isActive })}
            onClick={onNavigate}
          >
            My Training
          </NavLink>
          <p className="mt-2 px-3 text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]/90">
            Explore
          </p>
          <NavLink
            to="/explore/exercises"
            className={({ isActive }) =>
              cn(mobileNavItem({ active: isActive }), "pl-6")
            }
            onClick={onNavigate}
          >
            Exercises
          </NavLink>
          <NavLink
            to="/explore/templates"
            className={({ isActive }) =>
              cn(mobileNavItem({ active: isActive }), "pl-6")
            }
            onClick={onNavigate}
          >
            Templates
          </NavLink>
          <NavLink
            to="/explore/plans"
            className={({ isActive }) =>
              cn(mobileNavItem({ active: isActive }), "pl-6")
            }
            onClick={onNavigate}
          >
            Plans
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => mobileNavItem({ active: isActive })}
            onClick={onNavigate}
          >
            Profile
          </NavLink>
          <button
            type="button"
            className={cn(
              mobileNavItem({ active: false }),
              "cursor-pointer text-left",
            )}
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
            className={({ isActive }) => mobileNavItem({ active: isActive })}
            onClick={onNavigate}
          >
            Sign In
          </NavLink>
          <NavLink
            to="/sign-up"
            className={({ isActive }) => mobileNavItem({ active: isActive })}
            onClick={onNavigate}
          >
            Sign Up
          </NavLink>
        </>
      )}
    </nav>
  );
}

/** Sticky header with desktop nav (custom Explore dropdown) and mobile top drawer. */
export default function NavBar() {
  const { user, setUser } = React.useContext(UserContext);
  const location = useLocation();
  const exploreMatch = useMatch("/explore/*");
  const exploreActive = Boolean(exploreMatch);
  const [open, setOpen] = React.useState(false);
  const [exploreOpen, setExploreOpen] = React.useState(false);
  const exploreWrapRef = React.useRef(null);

  const handleSignOut = React.useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  }, [setUser]);

  const closeDrawer = React.useCallback(() => {
    setOpen(false);
  }, []);

  React.useEffect(() => {
    setOpen(false);
    setExploreOpen(false);
  }, [location.pathname, location.search]);

  React.useEffect(() => {
    if (!exploreOpen) return undefined;

    function handlePointerDown(event) {
      if (
        exploreWrapRef.current &&
        !exploreWrapRef.current.contains(event.target)
      ) {
        setExploreOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setExploreOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [exploreOpen]);

  const closeExploreMenu = React.useCallback(() => {
    setExploreOpen(false);
  }, []);

  return (
    <header className={navShellHeaderClass}>
      <div className="flex w-full max-w-[600px] flex-col">
        <div className="flex h-10 justify-between px-6 md:hidden">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "font-heading min-h-10 rounded-md px-2 py-1 text-lg font-bold tracking-tight no-underline transition-all duration-200",
                isActive
                  ? "bg-[#0c4a52]/50 font-semibold text-[#f8fafc] ring-1 ring-[#2dd4bf]/35"
                  : "text-[#f8fafc]/90 hover:bg-white/10 hover:text-[#2dd4bf]",
              )
            }
            end
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
                className="shrink-0 text-[#f8fafc]/90 hover:bg-white/10 hover:text-[#2dd4bf]"
                aria-expanded={open}
                aria-controls={MOBILE_DRAWER_ID}
                aria-label={open ? "Close menu" : "Open menu"}
              >
                {open ? "" : <MenuIcon className="size-5" aria-hidden />}
              </Button>
            </DrawerTrigger>
            <DrawerContent
              id={MOBILE_DRAWER_ID}
              className={navShellDrawerClass}
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
                    className="ml-auto shrink-0 text-[#f8fafc]/90 hover:bg-white/10 hover:text-[#2dd4bf]"
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

        <nav
          className="hidden w-full flex-1 py-3 md:flex md:min-h-16 md:items-center md:px-4"
          aria-label="Main"
        >

          
          <ul className="flex w-full flex-wrap items-center justify-start gap-1">
            <li>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  desktopNavItem({ active: isActive })
                }
                end
              >
                <HealthIsWealthWordmark />
              </NavLink>
            </li>

            {user ? (
              <>
                <li>
                  <NavLink
                    to="/training"
                    className={({ isActive }) =>
                      desktopNavItem({ active: isActive })
                    }
                  >
                    My Training
                  </NavLink>
                </li>
                <li className="relative" ref={exploreWrapRef}>
                  <button
                    type="button"
                    className={exploreDesktopTriggerClass(
                      exploreActive,
                      exploreOpen,
                    )}
                    aria-expanded={exploreOpen}
                    aria-haspopup="menu"
                    aria-controls={EXPLORE_DESKTOP_MENU_ID}
                    id="explore-desktop-trigger"
                    onClick={() => setExploreOpen((v) => !v)}
                  >
                    Explore
                    <ChevronDownIcon
                      className={cn(
                        "size-3.5 shrink-0 text-[#2dd4bf]/80 transition-transform duration-200",
                        exploreOpen && "rotate-180",
                      )}
                      aria-hidden
                    />
                  </button>
                  {exploreOpen ? (
                    <div
                      id={EXPLORE_DESKTOP_MENU_ID}
                      role="menu"
                      aria-labelledby="explore-desktop-trigger"
                      className="absolute left-0 top-full z-[40] mt-1.5 min-w-[13rem] overflow-hidden rounded-xl border border-[#2dd4bf]/35 bg-gradient-to-b from-[#0a1f28] to-[#061016] p-2 shadow-xl ring-1 ring-[#2dd4bf]/20 backdrop-blur-md"
                    >
                      <ul className="flex flex-col gap-0.5" role="none">
                        <li role="none">
                          <NavLink
                            to="/explore/exercises"
                            role="menuitem"
                            className={({ isActive }) =>
                              exploreDropdownItem({ active: isActive })
                            }
                            onClick={closeExploreMenu}
                          >
                            Exercises
                          </NavLink>
                        </li>
                        <li role="none">
                          <NavLink
                            to="/explore/templates"
                            role="menuitem"
                            className={({ isActive }) =>
                              exploreDropdownItem({ active: isActive })
                            }
                            onClick={closeExploreMenu}
                          >
                            Templates
                          </NavLink>
                        </li>
                        <li role="none">
                          <NavLink
                            to="/explore/plans"
                            role="menuitem"
                            className={({ isActive }) =>
                              exploreDropdownItem({ active: isActive })
                            }
                            onClick={closeExploreMenu}
                          >
                            Plans
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                  ) : null}
                </li>
                <li>
                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      desktopNavItem({ active: isActive })
                    }
                  >
                    Profile
                  </NavLink>
                </li>
                <li>
                  <button
                    type="button"
                    className={desktopNavItem({ active: false })}
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <NavLink
                    to="/sign-in"
                    className={({ isActive }) =>
                      desktopNavItem({ active: isActive })
                    }
                  >
                    Sign In
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/sign-up"
                    className={({ isActive }) =>
                      desktopNavItem({ active: isActive })
                    }
                  >
                    Sign Up
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
