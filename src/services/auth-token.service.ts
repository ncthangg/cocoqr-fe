import axios, { AxiosError, AxiosHeaders } from "axios";
import type { AxiosRequestConfig } from "axios";
import { getCookie, getFromLocalStorage, removeCookie, setCookie } from "../utils/storage";
import { clearCredentials } from "../store/slices/auth.slice";
import { store } from "../store";

/**
 * Constants cho key lưu token trong cookie
 */
export const ACCESS_TOKEN_KEY = "accessToken";
export const REFRESH_TOKEN_KEY = "refreshToken";

/**
 * Class phụ trách queue & refresh access token
 */
export class TokenRefresher {
    public refreshTokenPromise: Promise<string> | null = null;
    private failedQueue: Array<(token: string) => void> = [];

    public enqueueFailedRequest(cb: (token: string) => void) {
        this.failedQueue.push(cb);
    }

    public resolveQueue(newToken: string) {
        this.failedQueue.forEach((cb) => cb(newToken));
        this.failedQueue = [];
    }

    public refreshAccessToken(): Promise<string> {
        if (!this.refreshTokenPromise) {
            this.refreshTokenPromise = refreshToken()
                .then((newToken) => {
                    this.resolveQueue(newToken);
                    return newToken;
                })
                .catch((error) => {
                    this.failedQueue = [];
                    throw error;
                })
                .finally(() => {
                    this.refreshTokenPromise = null;
                });
        }
        return this.refreshTokenPromise;
    }
}

export const tokenRefresher = new TokenRefresher();

type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;
let hasPendingUnauthorized = false;

export const setSessionExpiredHandler = (handler: SessionExpiredHandler) => {
    sessionExpiredHandler = handler;

    if (hasPendingUnauthorized) {
        hasPendingUnauthorized = false;
        handler();
    }
};

/**
 * Refresh token request để lấy access token mới
 */
const refreshToken = async (): Promise<string> => {
    const storedRefreshToken = getCookie(REFRESH_TOKEN_KEY);
    const userId = getFromLocalStorage("loggedInUserId");

    if (!storedRefreshToken || !userId) {
        clearAuthAndRedirect();
        throw new AxiosError("Invalid refresh token or user ID");
    }

    try {
        const response = await axios.post(
            `https://localhost:7241/api/refreshToken?userId=${userId}&oldRT=${storedRefreshToken}`
        );
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        if (accessToken) {
            setCookie(ACCESS_TOKEN_KEY, accessToken, 60);
            setCookie(REFRESH_TOKEN_KEY, newRefreshToken, 60 * 24 * 7);
            return accessToken;
        }

        throw new AxiosError("Failed to refresh token: accessToken is missing");
    } catch (error: any) {
        if (
            error?.response?.data?.errorMessage === "RefreshToken không hợp lệ!" &&
            error?.response?.status === 403
        ) {
            clearAuthAndRedirect();
        } else if (axios.isAxiosError(error)) {
            console.error(
                "Refresh token failed (Axios error):",
                error.response?.data || error.message
            );
        }
        throw new AxiosError("Failed to refresh token: accessToken is missing");
    }
};

/** Thực sự clear session (cookies + Redux) và dùng cho bước logout cuối cùng */
export function finalizeSession() {
    removeCookie(ACCESS_TOKEN_KEY);
    removeCookie(REFRESH_TOKEN_KEY);
    store.dispatch(clearCredentials());
}

/**
 * Thông báo phiên hết hạn.
 * Không xoá cookie ngay lập tức – chỉ kích hoạt handler để UI (modal) quyết định
 * khi nào gọi finalizeSession().
 */
export function clearAuthAndRedirect() {
    if (sessionExpiredHandler) {
        sessionExpiredHandler();
    } else {
        hasPendingUnauthorized = true;
    }
}

/**
 * Helper: set Authorization header an toàn cho request retry
 */
export function setAuthorizationHeader(
    originalRequest: AxiosRequestConfig,
    newAccessToken: string
): void {
    if (!originalRequest) return;
    if (!originalRequest.headers) {
        originalRequest.headers = {};
    }
    if (typeof (originalRequest.headers as AxiosHeaders).set === "function") {
        (originalRequest.headers as AxiosHeaders).set(
            "Authorization",
            `Bearer ${newAccessToken}`
        );
    } else {
        originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccessToken}`,
        };
    }
}


