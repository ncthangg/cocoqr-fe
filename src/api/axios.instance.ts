import axios from "axios";
import EnvConfig from "../config/env.config";
import { getCookie } from "../utils/storage";
import { tokenRefresher, clearAuthAndRedirect, setAuthorizationHeader } from "../services/auth-token.service";

const axiosPublic = axios.create({
    baseURL: EnvConfig.API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosPublic.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        return Promise.reject(error);
    }
);

const axiosPrivate = axios.create({
    baseURL: EnvConfig.API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosPrivate.interceptors.request.use(
    (config) => {
        const token = getCookie("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosPrivate.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const prevRequest = error?.config;

        // Chỉ xử lý 401 và không retry lần 2
        if (error?.response?.status === 401 && !prevRequest?.sent) {
            prevRequest.sent = true;

            const refreshToken = getCookie("refreshToken");
            if (!refreshToken) {
                return Promise.reject(error);
            }

            try {
                // Gọi refresh token (có queue nếu nhiều request cùng lúc)
                const newAccessToken = await tokenRefresher.refreshAccessToken();

                // Cập nhật header cho request gốc rồi retry
                setAuthorizationHeader(prevRequest, newAccessToken);
                return axiosPrivate(prevRequest);
            } catch (_refreshError) {
                // Refresh thất bại → phiên đăng nhập hết hạn → mở modal
                clearAuthAndRedirect();
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    }
);

export { axiosPublic, axiosPrivate };

