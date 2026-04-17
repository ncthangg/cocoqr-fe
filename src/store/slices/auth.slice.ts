import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getFromLocalStorage, removeFromLocalStorage, setToLocalStorage } from "@/utils/storage";
import type { RoleRes, SignInGoogleRes, TokenRes, UserRes } from "@/models/entity.model";

export interface AuthState {
    user: UserRes | null;
    token: string | null; // Chỉ lưu accessToken
    roles: RoleRes[] | null;
    isAuthModalOpen: boolean;
    authModalTitle: string | null;
    isUserSynced: boolean;
    isRoleSelectionModalOpen: boolean;
    tempAuthData: SignInGoogleRes | null;
}

const AUTH_STORAGE_KEY = "ss_auth_state";

interface PersistedAuthState {
    user?: UserRes | null;
    token?: string | null;
    roles?: RoleRes[] | null;
    tempAuthData?: SignInGoogleRes | null;
    isRoleSelectionModalOpen?: boolean;
}

const loadPersistedAuthState = (): PersistedAuthState => {
    const stored = getFromLocalStorage(AUTH_STORAGE_KEY) as PersistedAuthState | null;
    if (stored && typeof stored === "object") {
        return {
            user: stored.user ?? null,
            token: typeof stored.token === 'string' ? stored.token : null,
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
    token: null as string | null,
    roles: null as RoleRes[] | null,
    isAuthModalOpen: false,
    authModalTitle: null as string | null,
    isUserSynced: false,
    isRoleSelectionModalOpen: false,
    tempAuthData: null,
    ...loadPersistedAuthState(),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        openAuthModal(state, action: PayloadAction<string | undefined>) {
            state.isAuthModalOpen = true;
            state.authModalTitle = action.payload || null;
        },
        closeAuthModal(state) {
            state.isAuthModalOpen = false;
            state.authModalTitle = null;
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
            state.token = action.payload.token.accessToken ?? null;
            state.roles = action.payload.roles;
            state.isAuthModalOpen = false;
            state.isUserSynced = true;
            // Đồng thời clear tempAuthData để tránh re-render thừa
            state.isRoleSelectionModalOpen = false;
            state.tempAuthData = null;
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
        syncUserFailed(state) {
            state.isUserSynced = true;
        },
        updateAccessToken(state, action: PayloadAction<string>) {
            state.token = action.payload;
            persistAuthState(state);
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
    syncUserFailed,
    updateAccessToken,
} = authSlice.actions;

export default authSlice.reducer;

