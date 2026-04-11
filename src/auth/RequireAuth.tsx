import { Navigate } from "react-router-dom";
import { useAuthContext } from "./AuthContext";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuthContext();

    if (isLoading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
export default RequireAuth;