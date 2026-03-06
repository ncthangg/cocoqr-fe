import { Navigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";
import { RouteConstant } from "../constants/route.constant";

const RequireRole = ({ roleName, children }: { roleName: string; children: React.ReactNode }) => {
    const { roles } = useAuthContext();
    const hasRole = roles?.some(
        (r) => r.roleName?.toLowerCase() === roleName.toLowerCase()
    );

    if (!hasRole) {
        return <Navigate to={RouteConstant.HOME} replace />;
    }
    return <>{children}</>;
};
export default RequireRole; 