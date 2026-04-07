import { Outlet } from "react-router-dom";

export function StudentLayout() {
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
