import { Outlet, useMatch } from "react-router";
import { cn } from "@/lib/utils";

/**
 * Shell for all `/` subtree routes. Landing (index `/`) is full-bleed hero; other
 * routes get a quiet teal-tinted background aligned with NavBar / landing palette.
 */
const AppLayout = () => {
  const isLanding = useMatch({ path: "/", end: true }) != null;

  return (
    <main className={cn("page-root", !isLanding && "page-root--app")}>
      <section className="page-shell">
        <Outlet />
      </section>
    </main>
  );
};

export default AppLayout;
