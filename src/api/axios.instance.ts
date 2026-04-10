import axios from "axios";
import EnvConfig from "../config/env.config";
import { getCookie } from "../utils/storage";
import { tokenRefresher, clearAuthAndRedirect, setAuthorizationHeader } from "../services/auth-token.service";
import { toast } from "react-toastify";

// Helper để toast lỗi dựa trên HTTP Status Codes
export const handleApiError = (error: any) => {
    const status = error?.response?.status;

    // Security Rules: generic error toasts only, never expose stack traces
    switch (status) {
        case 400:
            toast.error("Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.");
            break;
        case 401:
            toast.error("Phiên đăng nhập hết hạn hoặc không có quyền truy cập.");
            break;
        case 403:
            toast.error("Bạn không có quyền thực hiện thao tác này.");
            break;
        case 404:
            toast.error("Không tìm thấy dữ liệu yêu cầu.");
            break;
        case 429:
            toast.error("Bạn đã thao tác quá nhiều lần. Vui lòng thử lại sau 1 phút.");
            break;
        case 500:
        case 502:
        case 503:
        case 504:
            toast.error("Lỗi hệ thống từ máy chủ. Vui lòng thử lại sau.");
            break;
        default:
            toast.error("Lỗi kết nối đến máy chủ. Vui lòng thử lại.");
            break;
    }
};

const axiosPublic = axios.create({
    baseURL: EnvConfig.API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosPublic.interceptors.response.use(
    (response) => {
        if (response.data && response.data.code === "SUCCESS" && response.data.message) {
            toast.success(response.data.message);
        }
        return response.data;
    },
    async (error) => {
        handleApiError(error);
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
        console.log(error);
        return Promise.reject(error);
    }
);

axiosPrivate.interceptors.response.use(
    (response) => {
        if (response.data && response.data.code === "SUCCESS" && response.data.message) {
            toast.success(response.data.message);
        }
        return response.data;
    },
    async (error) => {
        const prevRequest = error?.config;

        // Chỉ xử lý 401 và không retry lần 2
        if (error?.response?.status === 401 && !prevRequest?.sent) {
            prevRequest.sent = true;

            const refreshToken = getCookie("refreshToken");
            if (!refreshToken) {
                handleApiError(error);
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
                handleApiError(error);
                return Promise.reject(error);
            }
        }

        // Với các mã lỗi khác hoặc đã retry mà vẫn fail
        if (error?.response?.status !== 401) {
            handleApiError(error);
        }

        return Promise.reject(error);
    }
);

export { axiosPublic, axiosPrivate };

