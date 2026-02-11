import { Navigate, Outlet } from "react-router";
import { getRoleId } from "utils/auth";

export default function MasterGuard() {
  const roleId = getRoleId();

  if (!roleId) {
    return <Navigate to="/login" replace />;
  }

  if (roleId !== 1) {
    return <Navigate to="/dashboards/home" replace />;
  }

  return <Outlet />;
}
