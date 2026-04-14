import React, { createContext, useContext } from "react";
import type { UserRes, RoleRes } from "../models/entity.model";
import { useAppDispatch, useAppSelector } from "../store/redux.hooks";
import { clearCredentials, closeRoleSelectionModal } from "../store/slices/auth.slice";
import { authApi } from "../services/auth-api.service";
import { removeCookie } from "../utils/storage";

interface AuthContextType {
    user: UserRes | null;
    token: string | null;
    roles: RoleRes[] | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isIntentionalLogout: boolean;
    logout: (callback?: () => void) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useAppDispatch();
    const { user, token, roles } = useAppSelector((state) => state.auth);

    const isAuthenticated = Boolean(
        user &&
        token
    );

    const isLoading = false;
    const isIntentionalLogout = React.useRef(false);

    const logout = async (callback?: () => void) => {
        isIntentionalLogout.current = true;
        try {
            await authApi.signOut();
        } catch (e) {
            // ignore
        } finally {
            dispatch(clearCredentials());
            dispatch(closeRoleSelectionModal());
            removeCookie("refreshToken");
            if (callback) {
                callback();
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, token, roles, isAuthenticated, isLoading, logout, isIntentionalLogout: isIntentionalLogout.current }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
};
