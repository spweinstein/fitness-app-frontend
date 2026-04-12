import { Outlet } from "react-router";

const Dashboard = () => {
  return (
    <main style={{ padding: "20px" }}>
      <section style={{ marginTop: "20px" }}>
        <Outlet />
      </section>
    </main>
  );
};

export default Dashboard;
