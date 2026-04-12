import { Outlet } from 'react-router'

const AppLayout = () => (
    <main className="page-root">
      <section className="page-shell">
        <Outlet />
      </section>
    </main>
  );

export default AppLayout
