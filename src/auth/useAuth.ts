import { useAuthContext } from "./AuthContext";

export const useAuth = () => {
    const { user, token, roles, isLoading, logout } = useAuthContext();

    return {
        user,
        token,
        roles,
        isLoading,
        logout,
        isAuthenticated: !!user && !!token && !!roles && !isLoading,
    };
};
