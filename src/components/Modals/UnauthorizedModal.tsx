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
        <>Phiên đăng nhập của bạn đã hết hạn hoặc không hợp lệ. Bạn sẽ được chuyển về trang đăng nhập sau <span className="font-semibold text-danger">{countdown}</span> giây.</>
    ) : (
        <>Bạn không có quyền truy cập vào trang này. Bạn sẽ được chuyển về trang chính sau <span className="font-semibold text-danger">{countdown}</span> giây.</>
    );
    const buttonText = isSessionExpired ? "Đăng nhập lại" : "Quay lại trang chính";

    return (
        <div
            className="modal-overlay"
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="modal-content max-w-modal-md relative flex flex-col overflow-hidden rounded-2xl p-lg md:p-xl text-center shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-md">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 p-3 rounded-full bg-danger/10 mb-lg">
                        <svg className="h-8 w-8 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground mb-md">{title}</h3>
                    <p className="text-sm text-foreground mb-lg px-2">
                        {description}
                    </p>
                </div>
                <div className="flex justify-center w-full">
                    <Button
                        value={buttonText}
                        onClick={onAction}
                        type="button"
                        size="large"
                        width="w-full"
                        className="btn-danger"
                    />
                </div>
            </div>
        </div>
    );
}
