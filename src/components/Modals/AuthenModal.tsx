import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../UICustoms/Button";
import type { SignInGoogleRes } from "../../models/entity.model";
import { buildGoogleAuthUrl, getBackendOrigin, GOOGLE_AUTH_TIMEOUT_MS, openGooglePopup, parseGoogleAuthPayload, registerGoogleAuthListener } from "../../utils/googleUtils";
import type { ApiSuccessResponse } from "../../models/system.model";
import { ApiConstant } from "../../constants/api.constant";
import { useAppDispatch, useAppSelector } from "../../store/redux.hooks";
import { closeAuthModal, setCredentials } from "../../store/slices/auth.slice";
import { setCookie } from "../../utils/storage";
import { toast } from "react-toastify";
import { RouteConstant } from "../../constants/route.constant";

const googleColors = {
    blue: "#4285F4",
    red: "#DB4437",
    yellow: "#F4B400",
    green: "#0F9D58",
};

const GoogleIcon: React.FC = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M21.35 11.1H12v2.91h5.35c-.23 1.24-.94 2.29-2 2.99v2.47h3.23c1.89-1.74 2.97-4.31 2.97-7.31 0-.7-.06-1.37-.2-2.06Z" fill={googleColors.blue} />
        <path d="M12 22c2.7 0 4.97-.89 6.62-2.44l-3.23-2.47c-.9.61-2.06.97-3.39.97-2.61 0-4.82-1.76-5.61-4.12H2.99v2.57C4.63 19.98 8.04 22 12 22Z" fill={googleColors.green} />
        <path d="M6.39 13.94c-.2-.61-.31-1.26-.31-1.94s.11-1.33.31-1.94V7.49H2.99A9.97 9.97 0 0 0 2 12c0 1.62.38 3.15.99 4.51l3.4-2.57Z" fill={googleColors.yellow} />
        <path d="M12 6.14c1.47 0 2.78.51 3.8 1.51l2.85-2.85C16.96 2.98 14.7 2 12 2 8.04 2 4.63 4.02 2.99 7.49l3.4 2.57c.79-2.36 3-4.12 5.61-4.12Z" fill={googleColors.red} />
    </svg>
);

const AuthenModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isAuthModalOpen } = useAppSelector((state) => state.auth);

    const [isLoading, setIsLoading] = useState(false);
    const popupRef = useRef<Window | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const popupWatcherRef = useRef<number | null>(null);
    const listenerCleanupRef = useRef<(() => void) | null>(null);
    const backendOrigin = getBackendOrigin();

    // Thu gom tất cả side-effects liên quan đến popup / listener / timeout
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
                console.debug(
                    "[GoogleAuth] Không thể đóng popup do COOP policy:",
                    error
                );
            }

            popupRef.current = null;
        }
    }, []);

    useEffect(() => {
        return () => {
            cleanupSideEffects();
        };
    }, [cleanupSideEffects]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    const handleClose = () => {
        if (isLoading) return;
        cleanupSideEffects();
        dispatch(closeAuthModal());
    };

    const handleLoginWithGoogle = async () => {
        setIsLoading(true);

        // 1. Chuẩn bị URL và cấu hình
        const frontendOrigin = window.location.origin;
        const authUrl = buildGoogleAuthUrl(ApiConstant.AUTH.SIGN_IN, frontendOrigin);

        // 2. Định nghĩa handler xử lý message từ backend
        const handleMessage = async (event: MessageEvent<ApiSuccessResponse<SignInGoogleRes>>) => {
            console.log("handleMessage", event);

            const parsedPayload = parseGoogleAuthPayload(event.data);
            console.log("parsedPayload", parsedPayload);
            if (!parsedPayload) {
                toast.error("Dữ liệu Google không hợp lệ.");
                setIsLoading(false);
                cleanupSideEffects();
                return;
            }

            if (parsedPayload.code === "SUCCESS" && parsedPayload.data) {
                // Đăng nhập thành công
                const { user, token, roles } = parsedPayload.data;

                // Lưu token vào cookies
                setCookie("accessToken", token.accessToken ?? "", 60);
                setCookie("refreshToken", token.refreshToken ?? "", 60 * 24 * 7);

                // Cập nhật Redux store
                dispatch(setCredentials({
                    user,
                    token,
                    roles,
                }));

                // Redirection logic
                if (roles[0].name === "admin") {
                    navigate(RouteConstant.ADMIN);
                } else {
                    navigate(RouteConstant.USER);
                }

                toast.success(`Chào mừng ${user.fullName}!`);
                cleanupSideEffects();
            } else {
                // Đăng nhập thất bại
                toast.error(parsedPayload.message || "Đăng nhập thất bại");
                cleanupSideEffects();
            }

            setIsLoading(false);
        };

        // 3. Đăng ký listener cho postMessage
        listenerCleanupRef.current = registerGoogleAuthListener(backendOrigin, handleMessage);

        // 4. Mở popup OAuth
        const popup = openGooglePopup(authUrl);
        if (!popup) {
            toast.error("Vui lòng bật popup để tiếp tục.");
            cleanupSideEffects();
            setIsLoading(false);
            return;
        }
        popupRef.current = popup;

        // 5. Thiết lập các listener để theo dõi popup
        const setupPopupWatchers = () => {
            // Listener cho window focus (phát hiện khi user quay lại từ popup)
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
            window.addEventListener('focus', handleWindowFocus);

            // Interval checker để theo dõi trạng thái popup
            popupWatcherRef.current = window.setInterval(() => {
                try {
                    if (popupRef.current && popupRef.current.closed) {
                        window.removeEventListener('focus', handleWindowFocus);
                        cleanupSideEffects();
                        setIsLoading(false);
                    }
                } catch (error) {
                    console.debug("[GoogleAuth] Không thể kiểm tra trạng thái popup do COOP policy:", error);
                }
            }, 500);

            // Timeout để tự động đóng sau thời gian quy định
            timeoutRef.current = window.setTimeout(() => {
                console.warn("[GoogleAuth] Đăng nhập quá thời gian, đóng popup.");
                toast.error("Hết thời gian đăng nhập. Vui lòng thử lại.");
                window.removeEventListener('focus', handleWindowFocus);
                cleanupSideEffects();
                setIsLoading(false);
            }, GOOGLE_AUTH_TIMEOUT_MS);
        };

        setupPopupWatchers();
    };

    if (!isAuthModalOpen) {
        return null;
    }
    return (
        <div
            className="modal-overlay px-md py-lg"
            onClick={handleClose}
        >
            <div
                className="modal-content max-w-modal-md relative flex flex-col overflow-hidden rounded-2xl p-0 md:flex-row shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute right-4 top-4 text-foreground-muted transition hover:text-foreground"
                    aria-label="Đóng"
                >
                    ✕
                </button>

                <div className="hidden w-1/2 items-center justify-center bg-gradient-to-br from-primary to-primary/80 p-lg text-white md:flex">
                    <div className="space-y-md text-center">
                        <div className="rounded-full bg-surface/20 px-md py-1 text-sm font-medium">Secret Sharing</div>
                        <h3 className="text-3xl font-semibold leading-tight">Bảo vệ bí mật của bạn</h3>
                        <p className="text-sm text-white/80">
                            Kết nối với Gmail để đồng bộ hoá dữ liệu, đảm bảo mọi secrets luôn được mã hoá và chỉ bạn mới có quyền giải mã.
                        </p>
                        <img
                            src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=700&q=80"
                            alt="Secure sharing illustration"
                            className="rounded-xl border border-white/10 object-cover shadow-lg"
                        />
                    </div>
                </div>

                <div className="flex w-full flex-col justify-center gap-lg p-lg md:w-1/2">
                    <div>
                        <h3 className="text-2xl font-semibold">Đăng nhập với Google</h3>
                    </div>

                    <Button
                        type="button"
                        icon={<GoogleIcon />}
                        onClick={handleLoginWithGoogle}
                        loading={isLoading}
                        size="large"
                        width="w-full h-12"
                        className="btn-outline font-semibold shadow-sm"
                    >
                        <span className="text-lg font-bold text-foreground">Login Google</span>
                    </Button>
                </div>
            </div>
        </div >
    );
};

export default AuthenModal;