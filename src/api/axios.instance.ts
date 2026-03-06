import axios from "axios";
import EnvConfig from "../config/env.config";
import { getCookie } from "../utils/storage";

const axiosPublic = axios.create({
    baseURL: EnvConfig.API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

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
        if (error?.response?.status === 401 && !prevRequest?.sent) {
            prevRequest.sent = true;
            // Handle token refresh logic here if needed
        }
        return Promise.reject(error);
    }
);

export { axiosPublic, axiosPrivate };
