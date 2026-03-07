import Button from "../UICustoms/Button";

export type UnauthorizedType = "SESSION_EXPIRED" | "NO_PERMISSION";

interface UnauthorizedModalProps {
    isOpen: boolean;
    type: UnauthorizedType;
    countdown: number;
    onAction: () => void;
}

export default function UnauthorizedModal({
    isOpen,
    type,
    countdown,
    onAction
}: UnauthorizedModalProps) {
    if (!isOpen) return null;

    const isSessionExpired = type === "SESSION_EXPIRED";
    const title = isSessionExpired ? "Phiên đăng nhập đã hết hạn" : "Không có quyền truy cập";
    const description = isSessionExpired ? (
        <>Phiên đăng nhập của bạn đã hết hạn hoặc không hợp lệ. Bạn sẽ được chuyển về trang đăng nhập sau <span className="font-semibold text-red-600">{countdown}</span> giây.</>
    ) : (
        <>Bạn không có quyền truy cập vào trang này. Bạn sẽ được chuyển về trang chính sau <span className="font-semibold text-red-600">{countdown}</span> giây.</>
    );
    const buttonText = isSessionExpired ? "Đăng nhập lại" : "Quay lại trang chính";

    return (
        <div
            className="modal-overlay bg-black/60 px-4 py-6"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="modal-content max-w-modal-md relative flex flex-col overflow-hidden rounded-2xl p-6 md:p-8 text-center shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 p-3 rounded-full bg-red-100 mb-6">
                        <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-[color:var(--color-text-primary)] mb-3">{title}</h3>
                    <p className="text-sm text-[color:var(--color-text-secondary)] mb-6 px-2">
                        {description}
                    </p>
                </div>
                <div className="flex justify-center w-full">
                    <Button
                        value={buttonText}
                        bgColor="bg-red-600"
                        textColor="text-white"
                        hoverColor="hover:bg-red-700"
                        onClick={onAction}
                        type="button"
                        size="large"
                        width="w-full"
                    />
                </div>
            </div>
        </div>
    );
}
