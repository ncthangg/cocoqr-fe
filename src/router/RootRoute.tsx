import { Navigate } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";
import { RouteConstant } from "../constants/route.constant";
import { RoleConstant } from "../constants/role.constant";
import { lazy } from "react";

const HomePage = lazy(() => import("@/pages/public/page"));

const RootRoute = () => {
    const { isAuthenticated, roles, isLoading } = useAuthContext();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!isAuthenticated || !roles) {
        return <HomePage />;
    }

    // Role-based redirect for root
    if (roles.some(r => r.name === RoleConstant.ADMIN)) {
        return <Navigate to={RouteConstant.ADMIN} replace />;
    }

    if (roles.some(r => r.name === RoleConstant.USER)) {
        return <Navigate to={RouteConstant.USER} replace />;
    }

    return <HomePage />;
};

export default RootRoute;
