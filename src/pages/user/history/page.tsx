import React from "react";

const QrHistoryPage: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
                <header className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-sm text-foreground-muted uppercase tracking-[0.2em] font-semibold">Lịch sử QR trả tiền</p>
                        <h1 className="mt-1 text-2xl font-bold text-foreground">Lịch sử giao dịch</h1>
                        <p className="mt-1 text-sm text-foreground-muted">Xem các mã QR đã tạo và các giao dịch trước đó.</p>
                    </div>
                </header>

                <div className="card bg-surface border border-border rounded-lg shadow-sm p-4 sm:p-5">
                    <div className="flex flex-col gap-2">
                        <div className="text-sm text-foreground">Chưa có dữ liệu</div>
                        <p className="text-base text-foreground-muted">Bạn chưa tạo giao dịch QR nào. Tạo mã QR để lưu lại lịch sử tại đây.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QrHistoryPage;
