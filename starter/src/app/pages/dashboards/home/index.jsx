import { useAuthContext } from "app/contexts/auth/context";
import AdminHome from "../admin";
import TeacherHome from "../teacher";

export default function HomeDispatcher() {
  const { user } = useAuthContext();
  const roleId = Number(user?.role?.roleid);

  if (roleId === 1) {
    return <AdminHome />;
  }

  if (roleId === 2) {
    return <TeacherHome />;
  }

  // Fallback for other roles (e.g. students might have their own redirect, but if they hit this)
  return <TeacherHome />;
}
