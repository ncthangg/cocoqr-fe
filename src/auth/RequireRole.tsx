import { useEffect } from "react";
import { useAuthContext } from "./AuthContext";
import { useUnauthorized } from "./UnauthorizedContext";
import { RouteConstant } from "../constants/route.constant";

const RequireRole = ({ roleName, children }: { roleName: string; children: React.ReactNode }) => {
    // console.log('RequireRole');
    const { roles, isAuthenticated, isLoading } = useAuthContext();
    const { showNoPermission } = useUnauthorized();

    const hasRole = roles?.some(
        (r) => r.name?.toLowerCase() === roleName.toLowerCase()
    );

    useEffect(() => {
        if (isLoading || !isAuthenticated) return;

        if (!hasRole) {
            const isAdmin = roles?.some(r => r.name?.toLowerCase() === "admin");
            const redirectPath = isAdmin ? RouteConstant.ADMIN : RouteConstant.USER;
            showNoPermission(redirectPath);
        }
    }, [isLoading, isAuthenticated, hasRole, roles, showNoPermission]);

    if (isLoading || !isAuthenticated || !hasRole) {
        return null;
    }

    return <>{children}</>;
};
export default RequireRole; 