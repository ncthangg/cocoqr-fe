import React, { useState, useEffect, useCallback } from "react";
import { Pin, QrCode, Eraser } from "lucide-react";
import Button from "../../../components/UICustoms/Button";
import { useAuth } from "@/auth/useAuth";
import { accountApi } from "@/services/account-api.service";
import { bankApi } from "@/services/bank-api.service";
import { providerApi } from "@/services/provider-api.service";
import { qrApi } from "@/services/qr-api.service";
import type { AccountRes, PagingVM, BankRes, PostQrRes, ProviderRes } from "@/models/entity.model";
import type { PostQrReq, PutAccountReq } from "@/models/entity.request.model";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { toast } from "react-toastify";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import QRDisplay from "@/components/UICustoms/QRDisplay";
import AccountProviderSelector from "@/components/UICustoms/Form/AccountProviderSelector";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";

const CreatePaymentPage: React.FC = () => {
    const { user } = useAuth();
    const userId = user?.userId;

    // API State
    const [accounts, setAccounts] = useState<AccountRes[]>([]);
    const [allProviders, setAllProviders] = useState<ProviderRes[]>([]);
    const [loading, setLoading] = useState(false);
    const [paging, setPaging] = useState<PagingVM<AccountRes>>({
        list: [],
        pageNumber: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0
    });
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [banks, setBanks] = useState<BankRes[]>([]);

    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [qrResult, setQrResult] = useState<PostQrRes | null>(null);
    const [qrLoading, setQrLoading] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchValue]);

    const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);

    const [selectedAccount, setSelectedAccount] = useState<AccountRes | null>(null);
    const [formData, setFormData] = useState<{ providerId: string, bank: string, bankName: string, bankLogo: string | null, number: string, amount: string, note: string }>({
        providerId: "",
        bank: "",
        bankName: "",
        bankLogo: null,
        number: "",
        amount: "",
        note: ""
    });

    const fetchProviders = useCallback(async () => {
        try {
            const res = await providerApi.getAll();
            if (res) {
                setAllProviders(res || []);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        }
    }, []);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    useEffect(() => {
        const fetchAllBanks = async () => {
            const provider = allProviders.find(p => p.id === formData.providerId);
            if (!provider || provider.code !== "BANK" || banks.length > 0) return;
            try {
                const res = await bankApi.getAll(1, 100, null, null, null, null);
                setBanks(res?.list || []);
            } catch (error) {
                console.error("Failed to fetch banks", error);
            }
        };
        fetchAllBanks();
    }, [formData.providerId, banks.length, allProviders]);

    const [rightWidth, setRightWidth] = useState<number>(600);

    const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
        mouseDownEvent.preventDefault();
        const startX = mouseDownEvent.clientX;
        const startWidth = rightWidth;

        const onMouseMove = (mouseMoveEvent: MouseEvent) => {
            const delta = startX - mouseMoveEvent.clientX;
            const newWidth = Math.max(320, Math.min(800, startWidth + delta));
            setRightWidth(newWidth);
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, [rightWidth]);

    const fetchAccounts = useCallback(async (
        page: number,
        size: number,
        search?: string,
        providerId?: string
    ) => {
        if (!userId) return;
        try {
            setLoading(true);
            const res = await accountApi.getAll(
                page, size, null, null, userId, providerId ?? null, search ?? null, true
            );
            if (res) {
                setAccounts(res.list || []);
                setPaging(res);
            }
        } catch (error) {
            console.error("Error fetching accounts:", error);
            toast.error("Không thể tải danh sách tài khoản.");
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchAccounts(paging.pageNumber, paging.pageSize, debouncedSearch, providerFilter);
    }, [fetchAccounts, paging.pageNumber, paging.pageSize, debouncedSearch, providerFilter]);


    const handlePageChange = (newPage: number) => {
        setPaging(prev => ({ ...prev, pageNumber: newPage }));
    };

    const handleOpenPin = (acc: AccountRes) => {
        setSelectedAccount(acc);
        setIsPinModalOpen(true);
    };

    const handlePinAccount = async () => {
        if (!selectedAccount) return;

        const isCurrentlyPinned = selectedAccount.isPinned;

        // Thêm kiểm tra giới hạn 5 tài khoản ghim nếu hành động là "Ghim"
        if (!isCurrentlyPinned) {
            const currentPinnedCount = accounts.filter(acc => acc.isPinned).length;
            if (currentPinnedCount >= 5) {
                toast.warning("Bạn chỉ có thể ghim tối đa 5 tài khoản.");
                setIsPinModalOpen(false);
                setSelectedAccount(null);
                return;
            }
        }

        try {
            setLoading(true);
            const req: PutAccountReq = {
                providerId: selectedAccount.providerId,
                bankCode: selectedAccount.bankCode ?? "",
                bankName: selectedAccount.bankName ?? "",
                accountHolder: selectedAccount.accountHolder ?? "",
                accountNumber: selectedAccount.accountNumber ?? "",
                isPinned: !isCurrentlyPinned, // Toggle trạng thái
                isActive: selectedAccount.isActive,
            };
            await accountApi.put(selectedAccount.id, req);
            //toast.success(isCurrentlyPinned ? "Bỏ ghim tài khoản thành công!" : "Ghim tài khoản thành công!");
            handleModalSuccess();
            setIsPinModalOpen(false);
        } catch (error) {
            console.error("Error toggling pin status:", error);
            toast.error(isCurrentlyPinned ? "Bỏ ghim tài khoản thất bại." : "Ghim tài khoản thất bại.");
        } finally {
            setLoading(false);
            setSelectedAccount(null);
        }
    };

    const handleModalSuccess = () => {
        fetchAccounts(paging.pageNumber, paging.pageSize, debouncedSearch, providerFilter);
    };

    const isProviderInactive = allProviders.find(p => p.id === formData.providerId)?.isActive === false;

    const isBankInactive = isProviderInactive && banks.find(b => b.bankCode === formData.bank)?.isActive === false;

    const handleCreateQR = async () => {
        if (!formData.providerId) {
            toast.warning("Vui lòng chọn loại tài khoản.");
            return;
        }
        if (!formData.number) {
            toast.warning("Vui lòng nhập số tài khoản / số điện thoại.");
            return;
        }
        const selectedProvider = allProviders.find(p => p.id === formData.providerId);
        const isBank = selectedProvider?.code === "BANK";
        if (isBank && !formData.bank) {
            toast.warning("Vui lòng chọn ngân hàng.");
            return;
        }
        if (isProviderInactive) {
            toast.warning("Phương thức thanh toán này hiện đang bảo trì.");
            return;
        }
        try {
            setQrLoading(true);
            const req: PostQrReq = {
                accountId: selectedAccount?.id ?? null,
                accountNumber: formData.number,
                bankCode: isBank ? formData.bank : null,
                amount: formData.amount ? Number(formData.amount) : null,
                description: formData.note || null,
                providerId: formData.providerId,
                isFixedAmount: !!formData.amount,
            };
            const res = await qrApi.post(req);
            setQrResult(res);
            toast.success("Tạo mã QR thành công!");
        } catch (error) {
            console.error("Error creating QR:", error);
            toast.error("Tạo mã QR thất bại.");
        } finally {
            setQrLoading(false);
        }
    };

    return (
        <div
            className="h-full w-full flex flex-col lg:flex-row gap-6 bg-bg flex-1 overflow-hidden"
            style={{ '--right-col-width': `${rightWidth}px` } as React.CSSProperties}
        >
            {/* Left Column: Saved Accounts */}
            <div className="flex-1 flex flex-col gap-4 h-full min-h-0 relative">
                <h2 className="text-xl font-bold text-text-primary shrink-0">Danh sách tài khoản hiện đang hoạt động</h2>

                <div className="bg-surface-base border border-border rounded-lg shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="shrink-0 border-b border-border">
                        <TableToolbar
                            value={searchValue}
                            onChange={setSearchValue}
                            placeholder="Tìm kiếm tài khoản..."
                            onResetPage={() => handlePageChange(1)}
                            filterValue={providerFilter !== undefined ? String(providerFilter) : ""}
                            filterOptions={allProviders.map(p => ({
                                label: p.code,
                                value: p.id
                            }))}
                            filterPlaceholder="Chọn loại..."
                            onFilterChange={(val) => setProviderFilter(val === undefined ? undefined : String(val))}
                        />
                    </div>

                    <div className="min-h-0 flex-1 overflow-hidden relative">
                        <DataTable
                            loading={loading}
                            data={accounts}
                            onRowClick={(acc) => {
                                setSelectedAccount(acc);
                                setFormData({
                                    providerId: acc.providerId,
                                    bank: acc.bankCode || "",
                                    bankName: acc.bankName || "",
                                    bankLogo: acc.bankLogoUrl || "",
                                    number: acc.accountNumber ?? "",
                                    amount: "",
                                    note: ""
                                });
                                setQrResult(null);
                            }}
                            selectedRowPredicate={(acc) => selectedAccount?.id === acc.id}
                            columns={[
                                {
                                    header: "TÊN TÀI KHOẢN",
                                    accessor: (acc) => acc.accountHolder,
                                    type: "string",
                                    cell: (acc) => acc.accountHolder
                                },
                                {
                                    header: "NGÂN HÀNG/VÍ",
                                    accessor: (acc) => acc.bankCode,
                                    type: "string",
                                    cell: (acc) => (
                                        <span className="inline-flex items-center gap-2">
                                            {acc.bankLogoUrl ? (
                                                <img src={resolveAvatarPreview(acc.bankLogoUrl ?? acc.providerLogoUrl)} alt={acc.bankShortName || acc.providerCode} className="w-10 h-10 object-contain rounded bg-white p-1 border border-border" />
                                            ) : (
                                                <div className="w-10 h-10 bg-surface-muted border border-border rounded flex items-center justify-center text-xs font-bold text-text-secondary">
                                                    {acc.bankCode ?? acc.providerCode}
                                                </div>
                                            )} {acc.bankName && acc.bankName !== acc.bankCode ? acc.bankName : acc.providerName}
                                            {/* {(acc.bankStatus === false || acc.providerStatus === false) && (
                                                <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded font-bold ml-1">BẢO TRÌ</span>
                                            )} */}
                                        </span>
                                    )
                                },
                                {
                                    header: "SỐ TÀI KHOẢN",
                                    accessor: (acc) => acc.accountNumber,
                                    type: "string",
                                    cell: (acc) => <span className="whitespace-nowrap">{acc.accountNumber}</span>
                                },
                                {
                                    header: "SỐ DƯ",
                                    accessor: (acc) => acc.balance,
                                    type: "number",
                                    cell: (acc) => <span className="whitespace-nowrap">{acc.balance}</span>
                                },
                                {
                                    header: "PIN",
                                    accessor: (acc) => acc.isPinned,
                                    type: "boolean",
                                    cell: (acc) =>
                                        <button
                                            onClick={() => handleOpenPin(acc)}
                                            className={`${acc.isPinned ? 'text-amber-500 hover:text-amber-700' : 'text-foreground-muted hover:text-amber-500'} transition-colors`}
                                            title={acc.isPinned ? "Bỏ ghim tài khoản" : "Ghim tài khoản"}
                                        >
                                            <Pin className={`w-4 h-4 ${acc.isPinned ? 'fill-amber-500' : ''}`} />
                                        </button>
                                }
                            ]}
                        />
                    </div>

                    <div className="shrink-0">
                        <TablePagination
                            pageNumber={paging.pageNumber}
                            pageSize={paging.pageSize}
                            totalItems={paging.totalItems}
                            totalPages={paging.totalPages}
                            loading={loading}
                            onPageChange={handlePageChange}
                            onPageSizeChange={(newSize) => {
                                setPaging(prev => ({ ...prev, pageSize: newSize, pageNumber: 1 }));
                            }}
                            pageSizeOptions={[5, 10, 20]} // Override pageSize options to have smaller default
                        />
                    </div>
                </div>
            </div>

            {/* Splitter */}
            <div
                className="hidden lg:flex w-2 cursor-col-resize items-center justify-center hover:bg-border bg-transparent group -mx-3 z-10 transition-colors"
                onMouseDown={startResizing}
            >
                <div className="h-10 w-1 rounded-full bg-border group-hover:bg-primary transition-colors" />
            </div>

            {/* Right Column: Create QR Form & Result */}
            <div className="w-full lg:w-[var(--right-col-width,450px)] shrink-0 flex flex-col gap-4 h-full min-h-0">

                <div className="flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-text-primary">Thông tin tạo mã QR</h2>
                    <button
                        className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        onClick={() => {
                            setFormData({ providerId: "", bank: "", bankName: "", bankLogo: "", number: "", amount: "", note: "" });
                            setSelectedAccount(null);
                            setQrResult(null);
                        }}
                        title="Xóa thông tin"
                    >
                        <Eraser className="w-5 h-5" />
                    </button>
                </div>

                {/* Top Section: Form */}
                <div className="card p-6 flex flex-col gap-5 shrink-0">
                    <AccountProviderSelector
                        providerId={formData.providerId}
                        bankCode={formData.bank}
                        bankName={formData.bankName}
                        bankLogo={formData.bankLogo}
                        onProviderChange={(id) => {
                            if (selectedAccount && id !== selectedAccount.providerId) setSelectedAccount(null);
                            setFormData({ ...formData, providerId: id, bank: "", bankName: "", bankLogo: "" });
                        }}
                        onBankSelect={(code, name, logo) => {
                            if (selectedAccount && code !== selectedAccount.bankCode) setSelectedAccount(null);
                            setFormData({ ...formData, bank: code, bankName: name, bankLogo: logo });
                        }}
                        isBankInactive={isBankInactive || false}
                        layout="horizontal"
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-secondary">Số tài khoản / Số điện thoại</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Nhập số tài khoản hoặc SĐT"
                            value={formData.number}
                            onChange={(e) => {
                                if (selectedAccount && e.target.value !== (selectedAccount.accountNumber ?? "")) setSelectedAccount(null);
                                setFormData({ ...formData, number: e.target.value });
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-secondary">Số tiền (VNĐ)</label>
                        <input
                            type="number"
                            className="input"
                            placeholder="Nhập số tiền"
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

                    {isProviderInactive && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-xs text-red-600 font-medium">
                                Phương thức thanh toán này hiện đang bảo trì. Vui lòng chọn phương thức thanh toán khác.
                            </p>
                        </div>
                    )}

                    {isBankInactive && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-xs text-red-600 font-medium">
                                Ngân hàng đang bảo trì. Vui lòng chọn ngân hàng khác.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4 mt-2">
                        <Button
                            size="large"
                            className="flex-1 btn-primary flex items-center justify-center gap-2"
                            onClick={handleCreateQR}
                            disabled={qrLoading || isBankInactive || isProviderInactive}
                        >
                            <QrCode className="w-5 h-5" />
                            {qrLoading ? "Đang tạo..." : (isBankInactive || isProviderInactive) ? "ĐANG BẢO TRÌ" : "TẠO QR"}
                        </Button>
                    </div>
                </div>

                {/* Bottom Section: QR Display */}
                <QRDisplay
                    qrImageUrl={qrResult?.qrImageUrl ?? null}
                    transactionRef={qrResult?.transactionRef}
                    onDownload={() => {
                        if (!qrResult?.qrImageUrl) return;
                        const a = document.createElement('a');
                        a.href = qrResult.qrImageUrl;
                        a.download = `QR_${qrResult.transactionRef ?? 'code'}.png`;
                        a.click();
                    }}
                    onCopyLink={() => {
                        if (!qrResult?.qrImageUrl) return;
                        navigator.clipboard.writeText(qrResult.qrImageUrl);
                        toast.success("Đã sao chép link ảnh QR!");
                    }}
                />

            </div>

            <ActionConfirmModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onConfirm={handlePinAccount}
                title={selectedAccount?.isPinned ? "Xác nhận bỏ ghim tài khoản" : "Xác nhận ghim tài khoản"}
                description={`Bạn có chắc chắn muốn ${selectedAccount?.isPinned ? 'bỏ ghim' : 'ghim'} tài khoản "${selectedAccount?.accountNumber || selectedAccount?.bankCode}" không?`}
                loading={loading}
                confirmText={selectedAccount?.isPinned ? "Bỏ ghim" : "Ghim"}
            />
        </div>
    );
};

export default CreatePaymentPage;
