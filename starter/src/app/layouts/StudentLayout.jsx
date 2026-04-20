import { Outlet } from "react-router-dom";

export function StudentLayout() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-900 text-slate-900 dark:text-dark-50 transition-colors duration-300">
      <main className="">
        <Outlet />
      </main>
    </div>
  );
}
