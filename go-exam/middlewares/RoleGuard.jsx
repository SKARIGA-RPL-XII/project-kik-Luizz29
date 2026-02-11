import { Navigate } from "react-router";
import { useAuth } from "hooks/useAuth";

const RoleGuard = ({ allow, children }) => {
  const { user } = useAuth(); 


  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.roleId)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default RoleGuard;
