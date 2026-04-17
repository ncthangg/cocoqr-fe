import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import type { SignInGoogleRes } from "../models/entity.model";
import { buildGoogleAuthUrl, getBackendOrigin, GOOGLE_AUTH_TIMEOUT_MS, openGooglePopup, parseGoogleAuthPayload, registerGoogleAuthListener } from "../utils/googleUtils";
import type { ApiSuccessResponse } from "../models/system.model";
import { ApiConstant } from "../constants/api.constant";
import { useAppDispatch } from "../store/redux.hooks";
import { openRoleSelectionModal } from "../store/slices/auth.slice";

export const useGoogleAuth = (onSuccessCallback?: () => void) => {
    const dispatch = useAppDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const popupRef = useRef<Window | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const popupWatcherRef = useRef<number | null>(null);
    const listenerCleanupRef = useRef<(() => void) | null>(null);
    const backendOrigin = getBackendOrigin();

    const cleanupSideEffects = useCallback(() => {
        if (listenerCleanupRef.current) {
            listenerCleanupRef.current();
            listenerCleanupRef.current = null;
        }
        if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (popupWatcherRef.current) {
            window.clearInterval(popupWatcherRef.current);
            popupWatcherRef.current = null;
        }
        if (popupRef.current) {
            try {
                popupRef.current.close();
            } catch (error) {
                console.debug("[GoogleAuth] Không thể đóng popup do COOP policy:", error);
            }
            popupRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            cleanupSideEffects();
        };
    }, [cleanupSideEffects]);

    const handleLoginWithGoogle = async () => {
        setIsLoading(true);

        const frontendOrigin = window.location.origin;
        const authUrl = buildGoogleAuthUrl(ApiConstant.AUTH.SIGN_IN, frontendOrigin);

        const handleMessage = async (event: MessageEvent<ApiSuccessResponse<SignInGoogleRes>>) => {
            const parsedPayload = parseGoogleAuthPayload(event.data);
            if (!parsedPayload) {
                toast.error("Dữ liệu Google không hợp lệ.");
                setIsLoading(false);
                cleanupSideEffects();
                return;
            }

            if (parsedPayload.code === "SUCCESS" && parsedPayload.data) {
                const { tokenRes: token, roleRes: roles } = parsedPayload.data;

                if (roles.length >= 1 && token?.accessToken) {
                    // Chỉ giữ lại accessToken trong tokenRes trước khi đưa vào Redux
                    const cleanedData: SignInGoogleRes = {
                        ...parsedPayload.data,
                        tokenRes: {
                            accessToken: token.accessToken,
                            refreshToken: undefined // Đảm bảo không có refreshToken trong Redux lúc này
                        }
                    };

                    // Mở modal chọn role (kể cả khi chỉ có 1 role để call switchRole)
                    dispatch(openRoleSelectionModal(cleanedData));
                    if (onSuccessCallback) {
                        onSuccessCallback();
                    }
                    cleanupSideEffects();
                } else {
                    toast.error("Không có thông tin xác thực hoặc không có quyền truy cập.");
                    cleanupSideEffects();
                }
            } else {
                toast.error(parsedPayload.message || "Đăng nhập thất bại");
                cleanupSideEffects();
            }

            setIsLoading(false);
        };

        listenerCleanupRef.current = registerGoogleAuthListener(backendOrigin, handleMessage);

        const popup = openGooglePopup(authUrl);
        if (!popup) {
            toast.error("Vui lòng bật popup để tiếp tục.");
            cleanupSideEffects();
            setIsLoading(false);
            return;
        }
        popupRef.current = popup;

        const setupPopupWatchers = () => {
            const handleWindowFocus = () => {
                setTimeout(() => {
                    try {
                        if (popupRef.current && popupRef.current.closed) {
                            cleanupSideEffects();
                            setIsLoading(false);
                        }
                    } catch (error) {
                        console.debug("[GoogleAuth] Không thể kiểm tra popup qua focus event:", error);
                    }
                }, 100);
            };
            window.addEventListener("focus", handleWindowFocus);

            popupWatcherRef.current = window.setInterval(() => {
                try {
                    if (popupRef.current && popupRef.current.closed) {
                        window.removeEventListener("focus", handleWindowFocus);
                        cleanupSideEffects();
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.debug("[GoogleAuth] Không thể kiểm tra trạng thái popup do COOP policy:", error);
                }
            }, 500);

            timeoutRef.current = window.setTimeout(() => {
                console.warn("[GoogleAuth] Đăng nhập quá thời gian, đóng popup.");
                toast.error("Hết thời gian đăng nhập. Vui lòng thử lại.");
                window.removeEventListener("focus", handleWindowFocus);
                cleanupSideEffects();
                setIsLoading(false);
            }, GOOGLE_AUTH_TIMEOUT_MS);
        };

        setupPopupWatchers();
    };

    return {
        isLoading,
        handleLoginWithGoogle,
        cleanupSideEffects,
    };
};
