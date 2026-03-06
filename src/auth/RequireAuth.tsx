import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
import { RouteConstant } from "../constants/route.constant";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuthContext();
    const location = useLocation();
    if (isLoading) return <div>Loading...</div>;
    if (!isAuthenticated) return <Navigate to={RouteConstant.HOME} state={{ from: location }} replace />;
    return <>{children}</>;
};
export default RequireAuth;