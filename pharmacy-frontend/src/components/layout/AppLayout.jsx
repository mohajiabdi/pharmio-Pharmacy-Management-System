import { Outlet } from "react-router-dom";
import Sidebar from "./sideBar";

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Sidebar />
      <main className="flex-1 p-6 lg:ml-70">
        <Outlet />
      </main>
    </div>
  );
}
