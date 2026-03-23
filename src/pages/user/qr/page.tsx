import React, { useState, useEffect, useCallback, useRef } from "react";
import { Pin, QrCode, Eraser, BookUser, X, ChevronRight } from "lucide-react";
import Button from "../../../components/UICustoms/Button";
import { accountApi } from "@/services/account-api.service";
import { providerApi } from "@/services/provider-api.service";
import { qrApi } from "@/services/qr-api.service";

import type { AccountRes, PagingVM, PostQrRes, ProviderRes } from "@/models/entity.model";
import type { PostQrReq, PutAccountReq } from "@/models/entity.request.model";
import { DataTable } from "@/components/UICustoms/Table/data-table";
import { TableToolbar } from "@/components/UICustoms/Table/table-toolbar";
import { TablePagination } from "@/components/UICustoms/Table/table-pagination";
import { toast } from "react-toastify";
import ActionConfirmModal from "@/components/UICustoms/Modal/ActionConfirmModal";
import QRDisplay from "@/components/UICustoms/QRDisplay";
import AccountProviderSelector from "@/components/UICustoms/Form/AccountProviderSelector";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";
import { ProviderCode } from "@/models/enum";
import ActionButton from "@/components/UICustoms/ActionButton";
import { cn } from "@/lib/utils";

const CreatePaymentPage: React.FC = () => {
    // API State
    const [accounts, setAccounts] = useState<AccountRes[]>([]);
    const [allProviders, setAllProviders] = useState<ProviderRes[]>([]);
    const [hasFetchedProviders, setHasFetchedProviders] = useState(false);
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
    const [isProviderMaintenance, setIsProviderMaintenance] = useState(false);
    const [isBankMaintenance, setIsBankMaintenance] = useState(false);

    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [qrResult, setQrResult] = useState<PostQrRes | null>(null);
    const [qrLoading, setQrLoading] = useState(false);

    // Account drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchValue);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchValue]);

    const [selectedAccount, setSelectedAccount] = useState<AccountRes | null>(null);
    const [formData, setFormData] = useState<{
        providerId: string,
        providerCode: string,
        providerName: string,
        isProviderInactive: boolean,
        napasBin?: string | null,
        bankCode?: string | null,
        bankShortName?: string | null,
        bankName?: string | null,
        bankLogoUrl?: string | null,
        isBankInactive?: boolean | null,
        number: string,
        amount: string,
        note: string
    }>({
        providerId: "",
        providerCode: "",
        providerName: "",
        isProviderInactive: false,
        napasBin: "",
        bankCode: "",
        bankShortName: "",
        bankName: "",
        bankLogoUrl: "",
        isBankInactive: null,
        number: "",
        amount: "",
        note: ""
    });

    const fetchProviders = useCallback(async () => {
        if (hasFetchedProviders) return;
        try {
            const res = await providerApi.getAll();
            if (res) {
                setAllProviders(res || []);
                setHasFetchedProviders(true);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        }
    }, [hasFetchedProviders]);

    const fetchAccounts = useCallback(async (
        page: number,
        size: number,
        search?: string,
        providerId?: string
    ) => {
        try {
            setLoading(true);
            const res = await accountApi.getAll(
                page, size, null, null, providerId ?? null, search ?? null, true
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
    }, []);

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
                isPinned: !isCurrentlyPinned,
                isActive: selectedAccount.isActive,
            };
            await accountApi.put(selectedAccount.id, req);
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

    const prov = allProviders.find(p => p.id === formData.providerId);
    const isProviderInactive = prov ? !prov.isActive : (formData.providerId ? isProviderMaintenance : false);
    const isBankInactive = isBankMaintenance;

    const handleCreateQR = async () => {
        if (!formData.providerId) {
            toast.warning("Vui lòng chọn loại tài khoản.");
            return;
        }
        if (!formData.number) {
            toast.warning("Vui lòng nhập số tài khoản / số điện thoại.");
            return;
        }

        const isBank = formData.providerCode === ProviderCode.BANK;

        if (isBank && !formData.bankCode && !selectedAccount) {
            toast.warning("Vui lòng chọn ngân hàng.");
            return;
        }
        if (isProviderInactive) {
            toast.warning("Phương thức thanh toán này hiện đang bảo trì.");
            return;
        }
        if (isBankInactive) {
            toast.warning("Ngân hàng này hiện đang bảo trì.");
            return;
        }
        try {
            setQrLoading(true);

            const req: PostQrReq = {
                providerId: formData.providerId,
                accountId: selectedAccount?.id ?? null,
                accountNumber: selectedAccount ? null : formData.number,
                bankCode: selectedAccount ? null : (isBank ? String(formData.bankCode) : null),
                amount: formData.amount ? Number(formData.amount) : null,
                description: formData.note || null,
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

    const handleSelectAccount = (acc: AccountRes) => {
        setSelectedAccount(acc);
        const isBank = acc.providerCode === ProviderCode.BANK;
        setFormData({
            providerId: acc.providerId,
            providerCode: acc.providerCode || "",
            providerName: acc.providerName || "",
            isProviderInactive: !acc.providerIsActive,
            napasBin: acc.napasBin || "",
            bankCode: acc.bankCode || "",
            bankShortName: acc.bankShortName || "",
            bankName: acc.bankName || "",
            bankLogoUrl: acc.bankLogoUrl || "",
            isBankInactive: isBank ? !acc.bankIsActive : null,
            number: acc.accountNumber ?? "",
            amount: "",
            note: ""
        });
        setIsProviderMaintenance(!acc.providerIsActive);
        setIsBankMaintenance(isBank ? !acc.bankIsActive : false);
        setQrResult(null);
        setIsDrawerOpen(false); // close drawer after selection
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const [leftPercent, setLeftPercent] = useState<number>(40);

    const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
        if (!containerRef.current) return;
        mouseDownEvent.preventDefault();
        const containerWidth = containerRef.current.offsetWidth;
        const startX = mouseDownEvent.clientX;
        const startPercent = leftPercent;

        const onMouseMove = (mouseMoveEvent: MouseEvent) => {
            const delta = mouseMoveEvent.clientX - startX;
            const deltaPct = (delta / containerWidth) * 100;
            const newPct = Math.max(30, Math.min(70, startPercent + deltaPct));
            setLeftPercent(newPct);
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            document.body.style.cursor = 'default';
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        document.body.style.cursor = 'col-resize';
    }, [leftPercent]);

    return (
        <div
            ref={containerRef}
            className="h-full w-full flex bg-bg flex-1 overflow-hidden relative qr-container"
        >

            {/* Account Drawer Overlay */}
            {isDrawerOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setIsDrawerOpen(false)}
                />
            )}

            {/* Account Drawer Panel */}
            <div className={cn(
                "fixed left-0 top-0 h-full z-50 bg-surface shadow-lg flex flex-col transition-all duration-300 ease-in-out border-r border-border",
                isDrawerOpen ? "w-[var(--drawer-width,480px)] translate-x-0 opacity-100" : "w-[var(--drawer-width,480px)] -translate-x-full opacity-0 pointer-events-none"
            )}>
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-lg border-b border-border/60 bg-surface-elevated shrink-0">
                    <div className="flex items-center gap-md">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <BookUser className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-foreground text-base">Tài khoản của bạn</h3>
                            <p className="text-xs text-foreground-muted">Chọn để điền nhanh thông tin</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsDrawerOpen(false)}
                        className="p-sm rounded-lg hover:bg-surface-muted text-foreground-muted hover:text-foreground transition-colors"
                        aria-label="Đóng danh sách"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="shrink-0 p-md border-b border-border/40 bg-surface-muted/5">
                    <TableToolbar
                        value={searchValue}
                        onChange={setSearchValue}
                        placeholder="Tìm kiếm tài khoản..."
                        onResetPage={() => handlePageChange(1)}
                        filterValue={providerFilter !== undefined ? String(providerFilter) : ""}
                        filterOptions={allProviders.map(p => ({
                            label: p.name,
                            value: p.id
                        }))}
                        filterPlaceholder="Chọn loại tài khoản..."
                        onFilterChange={(val) => setProviderFilter(val === undefined ? undefined : String(val))}
                        onFetchOptions={fetchProviders}
                    />
                </div>

                {/* Table */}
                <div className="min-h-0 flex-1 overflow-hidden relative">
                    <DataTable
                        loading={loading}
                        data={accounts}
                        onRowClick={handleSelectAccount}
                        selectedRowPredicate={(acc) => selectedAccount?.id === acc.id}
                        columns={[
                            {
                                header: "TÀI KHOẢN",
                                accessor: (acc) => acc.accountHolder,
                                type: "string",
                                cell: (acc) => (
                                    <div className="flex items-center gap-md">
                                        <div className="w-10 h-10 bg-white rounded-xl border border-border flex items-center justify-center p-xs shadow-sm shrink-0">
                                            {(acc.bankLogoUrl || acc.providerLogoUrl) ? (
                                                <img
                                                    src={resolveAvatarPreview(acc.bankLogoUrl ?? acc.providerLogoUrl ?? null)}
                                                    alt={acc.bankShortName || acc.providerName}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-primary uppercase">
                                                    {acc.bankCode?.substring(0, 3) || acc.providerCode?.substring(0, 3)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-semibold text-foreground text-base leading-tight uppercase truncate">
                                                {acc.accountHolder}
                                            </span>
                                            <span className="text-xs text-foreground-muted truncate">
                                                {(acc.bankCode && acc.bankName) ? acc.bankName : acc.providerName}
                                                {" · "}
                                                {acc.accountNumber}
                                            </span>
                                        </div>
                                        {(acc.bankIsActive === false || acc.providerIsActive === false) && (
                                            <span className="px-sm py-2xs bg-danger/10 text-danger font-bold text-[9px] uppercase rounded-md animate-pulse ml-auto border border-danger/20 shrink-0">
                                                Bảo trì
                                            </span>
                                        )}
                                    </div>
                                )
                            },
                            {
                                header: "PIN",
                                accessor: (acc) => acc.isPinned,
                                type: "boolean",
                                cell: (acc) =>
                                    <ActionButton
                                        icon={<Pin className={cn("w-4 h-4", acc.isPinned && "fill-amber-500")} />}
                                        onClick={() => handleOpenPin(acc)}
                                        color={acc.isPinned ? "amber" : "gray"}
                                        title={acc.isPinned ? "Bỏ ghim" : "Ghim"}
                                    />
                            }
                        ]}
                    />
                </div>

                {/* Pagination */}
                <div className="shrink-0 border-t border-border/40">
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
                        pageSizeOptions={[5, 10, 20]}
                    />
                </div>
            </div>

            {/* Left Column: QR Form (Resizable) */}
            <div
                className="flex flex-col gap-lg h-full min-h-0 overflow-y-auto px-lg py-md relative scrollbar-hidden animate-in fade-in slide-in-from-left-4 duration-500"
                style={{ width: `${leftPercent}%`, flexShrink: 0 }}
            >

                {/* Top: Title + Open Drawer Tag + Clear */}
                <div className="flex items-center justify-between shrink-0 mb-sm">
                    <div className="flex items-center gap-lg">
                        <h2 className="text-2xl font-extrabold text-foreground">Tạo QR</h2>
                        {/* Drawer Trigger Tag */}
                        <button
                            onClick={() => setIsDrawerOpen(true)}
                            className={cn(
                                "flex items-center gap-sm px-lg py-sm rounded-full text-xs font-bold border transition-all duration-300 hover:shadow-md",
                                selectedAccount
                                    ? "bg-primary text-primary-foreground border-primary shadow-md hover:scale-[1.02]"
                                    : "bg-surface border-border text-foreground-secondary hover:border-primary hover:text-primary"
                            )}
                            aria-label="Mở danh sách tài khoản"
                        >
                            <BookUser className="w-4 h-4" />
                            <span className="truncate max-w-[180px]">
                                {selectedAccount
                                    ? `${selectedAccount.accountHolder || selectedAccount.accountNumber}`
                                    : "Chọn từ danh sách tài khoản của bạn"
                                }
                            </span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <button
                        className="p-sm text-foreground-secondary hover:text-danger hover:bg-danger/5 rounded-md transition-all duration-300"
                        onClick={() => {
                            setFormData({
                                providerId: "",
                                providerCode: "",
                                providerName: "",
                                isProviderInactive: false,
                                napasBin: "",
                                bankCode: "",
                                bankShortName: "",
                                bankName: "",
                                bankLogoUrl: "",
                                isBankInactive: null,
                                number: "",
                                amount: "",
                                note: ""
                            });
                            setSelectedAccount(null);
                            setQrResult(null);
                            setIsProviderMaintenance(false);
                            setIsBankMaintenance(false);
                        }}
                        aria-label="Xóa thông tin"
                        title="Xóa thông tin"
                    >
                        <Eraser className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Card */}
                <div className="card p-lg flex flex-col gap-lg shadow-lg">
                    <AccountProviderSelector
                        providerId={formData.providerId}
                        providerCode={formData.providerCode}
                        providerName={formData.providerName}
                        napasBin={formData?.napasBin || ""}
                        bankCode={formData?.bankCode || ""}
                        bankShortName={formData?.bankShortName || ""}
                        bankLogoUrl={formData?.bankLogoUrl || ""}
                        allProviders={allProviders}
                        onFetchProviders={fetchProviders}
                        onProviderChange={(id) => {
                            if (selectedAccount && id !== selectedAccount.providerId) setSelectedAccount(null);
                            const p = allProviders.find(item => item.id === id);
                            setFormData({
                                ...formData,
                                providerId: id,
                                providerCode: p?.code ?? "",
                                providerName: p?.name ?? "",
                                isProviderInactive: false,
                                napasBin: "",
                                bankCode: "",
                                bankShortName: "",
                                bankLogoUrl: "",
                                isBankInactive: false,
                            });
                            setIsProviderMaintenance(p ? !p.isActive : false);
                            setIsBankMaintenance(false);
                        }}
                        onBankSelect={(napasBin, code, shortName, bankName, logoUrl, isActive) => {
                            if (selectedAccount && code !== selectedAccount.bankCode) setSelectedAccount(null);
                            setFormData({ ...formData, napasBin, bankCode: code, bankShortName: shortName, bankName: bankName, bankLogoUrl: logoUrl, isBankInactive: !isActive });
                            setIsBankMaintenance(!isActive);
                        }}
                        isProviderInactive={isProviderInactive || false}
                        isBankInactive={isBankInactive || null}
                        allowInactiveSelection={false}
                        layout="horizontal"
                    />

                    <div className="flex flex-col gap-sm">
                        <label htmlFor="accountNumber" className="text-sm font-medium text-foreground-secondary">Số tài khoản / Số điện thoại</label>
                        <input
                            id="accountNumber"
                            name="accountNumber"
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

                    <div className="grid grid-cols-2 gap-lg">
                        <div className="flex flex-col gap-sm">
                            <label htmlFor="amount" className="text-sm font-medium text-foreground-secondary">Số tiền (VNĐ)</label>
                            <input
                                id="amount"
                                name="amount"
                                type="number"
                                className="input"
                                placeholder="Nhập số tiền"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-sm">
                            <label htmlFor="note" className="text-sm font-medium text-foreground-secondary">Ghi chú (Tùy chọn)</label>
                            <input
                                id="note"
                                name="note"
                                type="text"
                                className="input"
                                placeholder="Nhập nội dung chuyển khoản"
                                value={formData.note}
                                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            />
                        </div>
                    </div>



                    {(isProviderInactive || isBankInactive) && (
                        <div className="p-md bg-danger/5 border border-danger/20 rounded-lg animate-in fade-in duration-300">
                            <p className="text-xs text-danger font-medium">
                                {isProviderInactive
                                    ? "Phương thức thanh toán này hiện đang bảo trì. Vui lòng chọn phương thức thanh toán khác."
                                    : "Ngân hàng đang bảo trì. Vui lòng chọn ngân hàng khác."}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-lg mt-sm">
                        <Button
                            size="large"
                            className="flex-1 btn-primary flex items-center justify-center gap-sm hover:scale-[1.01] transition-all duration-300"
                            onClick={handleCreateQR}
                            disabled={qrLoading || isBankInactive || isProviderInactive}
                        >
                            <QrCode className="w-5 h-5" />
                            {qrLoading ? "Đang tạo..." : (isBankInactive || isProviderInactive) ? "ĐANG BẢO TRÌ" : "TẠO QR"}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Resizable Splitter */}
            <div
                className="hidden lg:flex w-1 cursor-col-resize items-center justify-center hover:bg-primary/40 bg-border/20 group z-10 transition-all duration-200 self-stretch shrink-0"
                onMouseDown={startResizing}
            >
                <div className="h-12 w-0.5 rounded-full bg-border group-hover:bg-primary transition-all duration-300" />
            </div>

            {/* Right Column: QR Display (Resizable) */}
            <div
                className="flex flex-col gap-lg h-full min-h-0 overflow-y-auto px-lg py-md flex-1 min-w-0 scrollbar-hidden animate-in fade-in slide-in-from-right-4 duration-500"
                style={{ width: `${100 - leftPercent}%` }}
            >
                <h2 className="text-2xl font-extrabold text-foreground shrink-0 mb-sm">Mã QR</h2>
                <div className="flex-1 flex flex-col">
                    <QRDisplay
                        type="private"
                        qrData={qrResult?.qrData}
                        styleJson={qrResult?.styleJson}
                        transactionRef={qrResult?.transactionRef}
                        isWide={leftPercent <= 50}
                    />
                </div>
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
