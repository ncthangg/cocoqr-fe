import React, { useState } from "react";
import { Search, Plus, Edit, Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../../../components/UICustoms/Button";
import { toast } from "react-toastify";

interface Account {
    id: number;
    name: string;
    bank: string;
    number: string;
    type: "bank" | "wallet";
    createdAt: string;
}

const mockData: Account[] = [
    { id: 1, name: "NGUYEN VAN A", bank: "Vietcombank", number: "0123456789", type: "bank", createdAt: "2024-01-01" },
    { id: 2, name: "NGUYEN VAN A", bank: "MoMo", number: "0987654321", type: "wallet", createdAt: "2024-02-15" },
    { id: 3, name: "CONG TY TNHH ABC", bank: "Techcombank", number: "1903333333", type: "bank", createdAt: "2024-03-20" },
];

const AccountsPage: React.FC = () => {
    const [accounts, setAccounts] = useState<Account[]>(mockData);
    const [searchTerm, setSearchTerm] = useState("");

    // Modals state
    const [isAddEditModalOpen, setAddEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    // Select state
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

    // Form state
    const [formData, setFormData] = useState({ name: "", bank: "", number: "", type: "bank" });

    // Pagination (Mocked)
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Derived Data
    const filteredAccounts = accounts.filter(acc =>
        acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        acc.number.includes(searchTerm) ||
        acc.bank.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const displayedAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleOpenAdd = () => {
        setFormData({ name: "", bank: "", number: "", type: "bank" });
        setSelectedAccount(null);
        setAddEditModalOpen(true);
    };

    const handleOpenEdit = (acc: Account) => {
        setFormData({ name: acc.name, bank: acc.bank, number: acc.number, type: acc.type });
        setSelectedAccount(acc);
        setAddEditModalOpen(true);
    };

    const handleOpenDelete = (acc: Account) => {
        setSelectedAccount(acc);
        setDeleteModalOpen(true);
    };

    const handleSaveAccount = () => {
        if (!formData.name || !formData.bank || !formData.number) {
            toast.error("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        if (selectedAccount) {
            // Edit
            setAccounts(accounts.map(acc => acc.id === selectedAccount.id ? { ...acc, ...formData, type: formData.type as any } : acc));
            toast.success("Cập nhật tài khoản thành công!");
        } else {
            // Add
            const newAcc: Account = {
                id: Date.now(),
                ...formData,
                type: formData.type as any,
                createdAt: new Date().toISOString().split('T')[0]
            };
            setAccounts([...accounts, newAcc]);
            toast.success("Thêm tài khoản thành công!");
        }
        setAddEditModalOpen(false);
    };

    const handleDeleteAccount = () => {
        if (selectedAccount) {
            setAccounts(accounts.filter(acc => acc.id !== selectedAccount.id));
            toast.success("Xóa tài khoản thành công!");
            setDeleteModalOpen(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col gap-6 bg-bg">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-text-primary">Quản lý tài khoản</h1>
                <div className="flex gap-4">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-subtle w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            className="input pl-10 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        size="medium"
                        onClick={handleOpenAdd}
                        className="gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Thêm tài khoản
                    </Button>
                </div>
            </div>

            <div className="card flex-1 p-0 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="table w-full text-left">
                        <thead className="bg-surface-muted text-text-secondary text-sm">
                            <tr>
                                <th className="p-4 font-semibold">Tên tài khoản</th>
                                <th className="p-4 font-semibold">Ngân hàng / Ví</th>
                                <th className="p-4 font-semibold">Số tài khoản / SĐT</th>
                                <th className="p-4 font-semibold">Ngày tạo</th>
                                <th className="p-4 font-semibold text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {displayedAccounts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-text-subtle">
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center">
                                                <Search className="w-8 h-8 text-text-disabled" />
                                            </div>
                                            <p>Chưa có dữ liệu tài khoản.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                displayedAccounts.map((acc) => (
                                    <tr key={acc.id} className="hover:bg-surface-muted transition-colors">
                                        <td className="p-4 font-semibold text-text-primary">{acc.name}</td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700">
                                                {acc.bank}
                                            </span>
                                        </td>
                                        <td className="p-4 text-text-secondary">{acc.number}</td>
                                        <td className="p-4 text-text-secondary">{acc.createdAt}</td>
                                        <td className="p-4 flex gap-3 justify-end">
                                            <button
                                                onClick={() => handleOpenEdit(acc)}
                                                className="text-text-secondary hover:text-brand-600 transition-colors p-1"
                                                title="Sửa"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenDelete(acc)}
                                                className="text-text-secondary hover:text-red-500 transition-colors p-1"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-border flex items-center justify-between text-sm text-text-secondary">
                        <span>Hiển thị 1 đến {displayedAccounts.length} trong số {filteredAccounts.length} kết quả</span>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="p-2 rounded hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed border border-border"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="p-2 rounded hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed border border-border"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            {isAddEditModalOpen && (
                <div className="modal-overlay bg-black/50 px-4 flex items-center justify-center z-50">
                    <div className="modal-content max-w-md w-full bg-surface-base rounded-xl shadow-2xl p-6 relative fade-in">
                        <button
                            onClick={() => setAddEditModalOpen(false)}
                            className="absolute right-4 top-4 text-text-subtle hover:text-text-primary"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-bold text-text-primary mb-6">
                            {selectedAccount ? "Sửa tài khoản" : "Thêm tài khoản mới"}
                        </h2>

                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-secondary">Loại tài khoản</label>
                                <select
                                    className="input cursor-pointer"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="bank">Ngân hàng</option>
                                    <option value="wallet">Ví điện tử</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-secondary">Tên ngân hàng / Ví</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="VD: Vietcombank, MoMo"
                                    value={formData.bank}
                                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-secondary">Tên chủ tài khoản</label>
                                <input
                                    type="text"
                                    className="input uppercase"
                                    placeholder="NGUYEN VAN A"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-text-secondary">Số tài khoản / Số điện thoại</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Nhập số tài khoản"
                                    value={formData.number}
                                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 justify-end mt-4">
                                <Button
                                    bgColor="bg-transparent"
                                    textColor="text-text-secondary"
                                    hoverColor="hover:bg-surface-muted"
                                    className="border border-border"
                                    onClick={() => setAddEditModalOpen(false)}
                                >
                                    Hủy
                                </Button>
                                <Button onClick={handleSaveAccount}>
                                    Lưu tài khoản
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="modal-overlay bg-black/50 px-4 flex items-center justify-center z-50">
                    <div className="modal-content max-w-sm w-full bg-surface-base rounded-xl shadow-2xl p-6 relative fade-in text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-6 h-6 text-red-600" />
                        </div>
                        <h2 className="text-lg font-bold text-text-primary mb-2">Xóa tài khoản?</h2>
                        <p className="text-sm text-text-secondary mb-6">
                            Bạn có chắc chắn muốn xóa tài khoản <strong>{selectedAccount?.number}</strong> không? Hành động này không thể hoàn tác.
                        </p>

                        <div className="flex gap-3 justify-center">
                            <Button
                                bgColor="bg-transparent"
                                textColor="text-text-secondary"
                                hoverColor="hover:bg-surface-muted"
                                className="border border-border flex-1"
                                onClick={() => setDeleteModalOpen(false)}
                            >
                                Hủy
                            </Button>
                            <Button
                                bgColor="bg-red-600"
                                hoverColor="hover:bg-red-700"
                                className="flex-1"
                                onClick={handleDeleteAccount}
                            >
                                Xóa ngay
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountsPage;
