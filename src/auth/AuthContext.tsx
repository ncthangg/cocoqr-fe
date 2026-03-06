import React, { createContext, useContext } from "react";
import type { UserRes, TokenRes, RoleRes } from "../models/entity.model";
import { useAppDispatch, useAppSelector } from "../store/redux.hooks";
import { clearCredentials } from "../store/slices/auth.slice";
import { removeCookie } from "../utils/storage";

interface AuthContextType {
    user: UserRes | null;
    token: TokenRes | null;
    roles: RoleRes[] | null;
    // login: (user: UserRes, tokens: TokenRes, roles: RoleRes[]) => void;
    // logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => void;
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

    const logout = () => {
        dispatch(clearCredentials());
        removeCookie("accessToken");
        removeCookie("refreshToken");
    };

    return (
        <AuthContext.Provider
            value={{ user, token, roles, isAuthenticated, isLoading, logout }}
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
