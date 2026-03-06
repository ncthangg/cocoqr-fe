import Button from "../UICustoms/Button";

interface UnauthorizedModalProps {
    isOpen: boolean;
    countdown: number;
    onGoToLogin: () => void;
}

export default function UnauthorizedModal({
    isOpen,
    countdown,
    onGoToLogin
}: UnauthorizedModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white bg-opacity-50 z-[9999] flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 text-center">
                <div className="mb-4">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Phiên đăng nhập đã hết hạn</h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Phiên đăng nhập của bạn đã hết hạn hoặc không hợp lệ. Bạn sẽ được chuyển về trang đăng nhập sau <span className="font-semibold text-red-600">{countdown}</span> giây.
                    </p>
                </div>
                <div className="flex justify-center">
                    <Button
                        value="Đăng nhập lại ngay"
                        bgColor="bg-red-600"
                        textColor="text-white"
                        hoverColor="hover:bg-red-700"
                        onClick={onGoToLogin}
                    />
                </div>
            </div>
        </div>
    );
}
