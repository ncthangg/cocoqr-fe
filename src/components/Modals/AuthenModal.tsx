import { useCallback, useEffect } from "react";
import Button from "../UICustoms/Button";
import { useAppDispatch, useAppSelector } from "../../store/redux.hooks";
import { closeAuthModal } from "../../store/slices/auth.slice";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";
import Logo from "@/components/UICustoms/Logo";

const googleColors = {
    blue: "#4285F4",
    red: "#DB4437",
    yellow: "#F4B400",
    green: "#0F9D58",
};

const GoogleIcon: React.FC = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:scale-110">
        <path d="M21.35 11.1H12v2.91h5.35c-.23 1.24-.94 2.29-2 2.99v2.47h3.23c1.89-1.74 2.97-4.31 2.97-7.31 0-.7-.06-1.37-.2-2.06Z" fill={googleColors.blue} />
        <path d="M12 22c2.7 0 4.97-.89 6.62-2.44l-3.23-2.47c-.9.61-2.06.97-3.39.97-2.61 0-4.82-1.76-5.61-4.12H2.99v2.57C4.63 19.98 8.04 22 12 22Z" fill={googleColors.green} />
        <path d="M6.39 13.94c-.2-.61-.31-1.26-.31-1.94s.11-1.33.31-1.94V7.49H2.99A9.97 9.97 0 0 0 2 12c0 1.62.38 3.15.99 4.51l3.4-2.57Z" fill={googleColors.yellow} />
        <path d="M12 6.14c1.47 0 2.78.51 3.8 1.51l2.85-2.85C16.96 2.98 14.7 2 12 2 8.04 2 4.63 4.02 2.99 7.49l3.4 2.57c.79-2.36 3-4.12 5.61-4.12Z" fill={googleColors.red} />
    </svg>
);

const AuthenModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isAuthModalOpen, authModalTitle } = useAppSelector((state) => state.auth);

    const handleCloseModal = useCallback(() => {
        dispatch(closeAuthModal());
    }, [dispatch]);

    const { isLoading, handleLoginWithGoogle, cleanupSideEffects } = useGoogleAuth(handleCloseModal);

    const handleClose = useCallback(() => {
        if (isLoading) return;
        cleanupSideEffects();
        handleCloseModal();
    }, [isLoading, cleanupSideEffects, handleCloseModal]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [handleClose]);

    const handleStopPropagation = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

    if (!isAuthModalOpen) {
        return null;
    }

    return (
        <div
            className="modal-overlay fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm transition-all duration-300"
            onClick={handleClose}
        >
            <div
                className="modal-content max-w-modal-md relative flex flex-col overflow-hidden rounded-2xl bg-surface p-0 shadow-2xl duration-200 animate-in zoom-in-95"
                onClick={handleStopPropagation}
            >
                <div className="relative flex w-full flex-col items-center justify-center gap-6 p-8 text-center sm:p-12 select-none cursor-default">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute right-4 top-4 rounded-full p-2 text-foreground-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                        aria-label="Đóng"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>

                    {/* Icon image */}
                    <div className="mb-2 flex items-center justify-center">
                        <Logo
                            size="100px"
                        />
                    </div>

                    {/* Name */}
                    <div className="space-y-1">
                        <h3 className="text-3xl font-bold tracking-tight text-foreground">CocoQR</h3>
                    </div>

                    {/* Short text describe */}
                    {authModalTitle ? (
                        <p className="mx-auto text-[15px] font-bold text-primary leading-relaxed max-w-[320px] animate-in fade-in duration-500">
                            {authModalTitle}
                        </p>
                    ) : (
                        <p className="mx-auto text-lg font-medium text-foreground-muted">
                            <span className="text-primary tracking-tight">Tạo mã QR thanh toán nhanh chóng.</span>
                            <br />
                            <span className="text-primary tracking-tight">Tạo phong cách mã QR của riêng bạn.</span>
                        </p>
                    )}

                    {/* Button signin */}
                    <div>
                        <Button
                            type="button"
                            icon={<GoogleIcon />}
                            onClick={handleLoginWithGoogle}
                            loading={isLoading}
                            size="large"
                            width="w-full h-12"
                            className="btn-outline group relative overflow-hidden rounded-xl font-semibold shadow-sm transition-all duration-300 hover:border-primary/40 hover:bg-surface hover:shadow-md hover:shadow-primary/10 active:scale-[0.98]"
                        >
                            <span className="text-base font-bold text-foreground transition-transform group-hover:scale-[1.02]">
                                Tiếp tục với Google
                            </span>
                        </Button>
                    </div>

                    {/* Term of use and Privacy policy */}
                    <p className="mt-2 text-center text-xs leading-relaxed text-foreground-muted">
                        Nếu tiếp tục, bạn đã đồng ý với <br /> <a href="#" className="font-medium text-primary transition-colors hover:text-primary-hover hover:underline">Điều khoản sử dụng</a> và <a href="#" className="font-medium text-primary transition-colors hover:text-primary-hover hover:underline">Chính sách bảo mật</a> của chúng tôi.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthenModal;