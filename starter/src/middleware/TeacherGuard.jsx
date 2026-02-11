import { Navigate, Outlet } from "react-router";
import { getRoleId } from "utils/auth";

export default function TeacherGuard() {
  const roleId = getRoleId();

  if (!roleId) {
    return <Navigate to="/login" replace />;
  }

  if (roleId !== 2) {
    return <Navigate to="/dashboards/home" replace />;
  }

  return <Outlet />;
}
