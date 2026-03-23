import { useEffect } from "react";
import { useAuthContext } from "./AuthContext";
import { useUnauthorized } from "./UnauthorizedContext";

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, isLoading, isIntentionalLogout } = useAuthContext();
    const { showSessionExpired } = useUnauthorized();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            if (!isIntentionalLogout) {
                showSessionExpired();
            }
        }
    }, [isLoading, isAuthenticated, showSessionExpired, isIntentionalLogout]);

    if (isLoading || !isAuthenticated) return null;

    return <>{children}</>;
};
export default RequireAuth;