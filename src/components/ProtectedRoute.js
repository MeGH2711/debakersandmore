import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const session = localStorage.getItem("adminSession");
  if (!session) return <Navigate to="/login" replace />;

  const { expiry } = JSON.parse(session);
  if (new Date().getTime() > expiry) {
    localStorage.removeItem("adminSession");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;