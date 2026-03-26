import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from "@/utils/storage";
import type { RoleRes, SignInGoogleRes, TokenRes, UserRes } from "@/models/entity.model";

export interface AuthState {
    user: UserRes | null;
    token: TokenRes | null;
    roles: RoleRes[] | null;
    isAuthModalOpen: boolean;
    isUserSynced: boolean;
    isRoleSelectionModalOpen: boolean;
    tempAuthData: SignInGoogleRes | null;
}

const AUTH_STORAGE_KEY = "ss_auth_state";

interface PersistedAuthState {
    user?: UserRes | null;
    token?: TokenRes | null;
    roles?: RoleRes[] | null;
    tempAuthData?: SignInGoogleRes | null;
    isRoleSelectionModalOpen?: boolean;
}

const loadPersistedAuthState = (): PersistedAuthState => {
    const stored = getFromLocalStorage(AUTH_STORAGE_KEY) as PersistedAuthState | null;
    if (stored && typeof stored === "object") {
        return {
            user: stored.user ?? null,
            token: stored.token ?? null,
            roles: stored.roles ?? null,
            tempAuthData: stored.tempAuthData ?? null,
            isRoleSelectionModalOpen: stored.isRoleSelectionModalOpen ?? false,
        };
    }
    return { user: null, token: null, roles: null, tempAuthData: null, isRoleSelectionModalOpen: false };
};

const persistAuthState = (state: Pick<AuthState, "user" | "token" | "roles" | "tempAuthData" | "isRoleSelectionModalOpen">) => {
    if ((state.token && state.user) || state.tempAuthData) {
        setToLocalStorage(AUTH_STORAGE_KEY, state);
    } else {
        removeFromLocalStorage(AUTH_STORAGE_KEY);
    }
};

const initialState: AuthState = {
    user: null as UserRes | null,
    token: null as TokenRes | null,
    roles: null as RoleRes[] | null,
    isAuthModalOpen: false,
    isUserSynced: false,
    isRoleSelectionModalOpen: false,
    tempAuthData: null,
    ...loadPersistedAuthState(),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        openAuthModal(state) {
            state.isAuthModalOpen = true;
        },
        closeAuthModal(state) {
            state.isAuthModalOpen = false;
        },
        openRoleSelectionModal(state, action: PayloadAction<SignInGoogleRes>) {
            state.tempAuthData = action.payload;
            state.isRoleSelectionModalOpen = true;
            state.isAuthModalOpen = false;
            persistAuthState(state);
        },
        closeRoleSelectionModal(state) {
            state.isRoleSelectionModalOpen = false;
            state.tempAuthData = null;
            persistAuthState(state);
        },
        setCredentials(state, action: PayloadAction<{ user: UserRes; token: TokenRes; roles: RoleRes[] }>) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.roles = action.payload.roles;
            state.isAuthModalOpen = false;
            state.isUserSynced = true;
            persistAuthState(state);
        },
        clearCredentials(state) {
            state.user = null;
            state.token = null;
            state.roles = null;
            state.isUserSynced = false;
            persistAuthState(state);
        },
        loadUserInfo(state, action: PayloadAction<{ user: UserRes }>) {
            if (state.token) {
                state.user = action.payload.user;
                state.isUserSynced = true;
                persistAuthState(state);
            }
        },
        startUserSync(state) {
            state.isUserSynced = false;
        },
    },
});

export const {
    openAuthModal,
    closeAuthModal,

    openRoleSelectionModal,
    closeRoleSelectionModal,

    setCredentials,
    clearCredentials,

    loadUserInfo,
    startUserSync,
} = authSlice.actions;

export default authSlice.reducer;

