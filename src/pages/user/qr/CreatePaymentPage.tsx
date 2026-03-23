import React, { useState } from "react";
import { Search, Copy, Download, QrCode } from "lucide-react";
import Button from "../../../components/UICustoms/Button";

const CreatePaymentPage: React.FC = () => {
    // Mock state for accounts
    const [accounts] = useState<any[]>([
        { id: 1, name: "NGUYEN VAN A", bank: "vcb", number: "0123456789", type: "bank" },
        { id: 2, name: "NGUYEN VAN A", bank: "momo", number: "0987654321", type: "wallet" },
        { id: 3, name: "CONG TY TNHH ABC", bank: "tcb", number: "1903333333", type: "bank" },
    ]);
    const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ bank: "", number: "", amount: "", note: "" });

    // Handle auto-fill when selecting an account
    React.useEffect(() => {
        if (selectedAccountId) {
            const acc = accounts.find(a => a.id === selectedAccountId);
            if (acc) {
                setFormData(prev => ({ ...prev, bank: acc.bank, number: acc.number }));
            }
        }
    }, [selectedAccountId, accounts]);

    return (
        <div className="h-full w-full flex flex-col lg:flex-row gap-6 bg-bg">
            {/* Left Column: Saved Accounts */}
            <div className="flex-1 flex flex-col gap-4">
                <h2 className="text-xl font-bold text-text-primary">Danh sách tài khoản đã lưu</h2>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tài khoản..."
                        className="input pl-10 w-full"
                    />
                </div>

                {/* Account List / Empty State */}
                <div className="flex-1 bg-surface-base rounded-lg border border-border p-4 overflow-y-auto">
                    {accounts.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-text-subtle space-y-4 py-12">
                            <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center">
                                <Search className="w-8 h-8 text-text-disabled" />
                            </div>
                            <p>Chưa có tài khoản nào được lưu.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {accounts.map(acc => (
                                <div
                                    key={acc.id}
                                    onClick={() => setSelectedAccountId(acc.id)}
                                    className={`p-3 rounded-lg border transition-all cursor-pointer flex flex-col gap-1 
                                        ${selectedAccountId === acc.id
                                            ? 'border-brand-500 bg-brand-50'
                                            : 'border-border bg-surface-base hover:border-brand-300 hover:bg-surface-muted'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-text-primary">{acc.name}</span>
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface-muted text-text-secondary">
                                            {acc.type === 'bank' ? 'Ngân hàng' : 'Ví điện tử'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-text-secondary flex gap-2">
                                        <span className="font-medium text-text-primary">
                                            {acc.bank === 'vcb' ? 'Vietcombank' : acc.bank === 'momo' ? 'MoMo' : 'Techcombank'}
                                        </span>
                                        <span>•</span>
                                        <span>{acc.number}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Create QR Form & Result */}
            <div className="flex-1 flex flex-col gap-6">

                {/* Top Section: Form */}
                <div className="card p-6 flex flex-col gap-5">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Thông tin tạo mã QR</h3>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-secondary">Ngân hàng / Ví điện tử</label>
                        <select
                            className="input cursor-pointer"
                            value={formData.bank}
                            onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                        >
                            <option value="">Chọn ngân hàng / ví</option>
                            <option value="vcb">Vietcombank</option>
                            <option value="momo">MoMo</option>
                            <option value="tcb">Techcombank</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-secondary">Số tài khoản / Số điện thoại</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Nhập số tài khoản hoặc SĐT"
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-secondary">Số tiền (VNĐ)</label>
                        <input
                            type="number"
                            className="input"
                            placeholder="0"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-secondary">Ghi chú (Tùy chọn)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Nhập nội dung chuyển khoản"
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        />
                    </div>

                    <Button className="w-full mt-2" size="large">
                        Tạo QR
                    </Button>
                </div>

                {/* Bottom Section: QR Display */}
                <div className="card p-6 flex flex-col items-center justify-center gap-6 flex-1 min-h-[300px]">
                    <div className="w-48 h-48 bg-surface-muted rounded-xl flex items-center justify-center border-2 border-dashed border-border">
                        <QrCode className="w-16 h-16 text-text-disabled" />
                        {/* QR Image will be rendered here */}
                    </div>

                    <div className="flex gap-4 w-full max-w-sm">
                        <Button
                            className="flex-1 flex gap-2 items-center justify-center"
                            variant="outline"
                        >
                            <Download className="w-4 h-4" />
                            Tải xuống
                        </Button>
                        <Button
                            className="flex-1 flex gap-2 items-center justify-center"
                            variant="outline"
                        >
                            <Copy className="w-4 h-4" />
                            Copy Link
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CreatePaymentPage;
