import React, { useState, useEffect, useCallback, useRef } from "react";
import { Pin, QrCode, Eraser } from "lucide-react";
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
    const [formData, setFormData] = useState<{
        providerId: string,
        providerCode?: string,
        providerName?: string,
        napasBin: string,
        bankCode: string,
        bankName: string,
        bankLogo: string | null,
        number: string,
        amount: string,
        note: string
    }>({
        providerId: "",
        providerCode: undefined,
        providerName: undefined,
        napasBin: "",
        bankCode: "",
        bankName: "",
        bankLogo: null,
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



    const containerRef = useRef<HTMLDivElement>(null);
    const [leftPercent, setLeftPercent] = useState<number>(50);

    const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
        if (!containerRef.current) return;
        mouseDownEvent.preventDefault();
        const containerWidth = containerRef.current.offsetWidth;
        const startX = mouseDownEvent.clientX;
        const startPercent = leftPercent;

        const onMouseMove = (mouseMoveEvent: MouseEvent) => {
            const delta = mouseMoveEvent.clientX - startX;
            const deltaPct = (delta / containerWidth) * 100;
            // Left col: min 20%, max 70% → right col always has 30-80%
            const newPct = Math.max(30, Math.min(70, startPercent + deltaPct));
            setLeftPercent(newPct);
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
    }, [leftPercent]);

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
        const selectedProvider = allProviders.find(p => p.id === formData.providerId);
        const isBank = selectedProvider?.code === ProviderCode.BANK;
        if (isBank && !formData.bankCode) {
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
                providerId: formData.providerId,

                accountId: selectedAccount?.id ?? null,
                accountNumber: formData.number,

                bankCode: isBank ? formData.bankCode : null,
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

    return (
        <div
            ref={containerRef}
            className="h-full w-full flex flex-col lg:flex-row bg-bg flex-1 overflow-hidden gap-0"
        >
            {/* Left Column: Saved Accounts */}
            <div
                className="flex flex-col gap-4 h-full min-h-0 relative hidden lg:flex"
                style={{ width: `${leftPercent}%`, flexShrink: 0, flexGrow: 0 }}
            >
                <h2 className="text-3xl font-extrabold text-foreground shrink-0">Tạo nhanh với danh sách tài khoản của bạn</h2>

                <div className="bg-surface-elevated border border-border/60 rounded-[2rem] shadow-xl shadow-black/5 flex flex-col min-h-0 overflow-hidden border-b-0">
                    <div className="shrink-0 p-4 border-b border-border/40 bg-surface-muted/10">
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

                    <div className="min-h-0 flex-1 overflow-hidden relative">
                        <DataTable
                            loading={loading}
                            data={accounts}
                            onRowClick={(acc) => {
                                setSelectedAccount(acc);
                                setFormData({
                                    providerId: acc.providerId,
                                    providerCode: acc.providerCode,
                                    providerName: acc.providerName,
                                    napasBin: acc.napasBin || "",
                                    bankCode: acc.bankCode || "",
                                    bankName: acc.bankName || "",
                                    bankLogo: acc.bankLogoUrl || "",
                                    number: acc.accountNumber ?? "",
                                    amount: "",
                                    note: ""
                                });
                                setIsProviderMaintenance(acc.providerIsActive === false);
                                setIsBankMaintenance(acc.bankIsActive === false);
                                setQrResult(null);
                            }}
                            selectedRowPredicate={(acc) => selectedAccount?.id === acc.id}
                            columns={[
                                {
                                    header: "TÊN TÀI KHOẢN",
                                    accessor: (acc) => acc.accountHolder,
                                    type: "string",
                                    maxWidth: "320px",
                                    truncate: true,
                                    cell: (acc) => <span className="font-semibold uppercase">{acc.accountHolder}</span>
                                },
                                {
                                    header: "NGÂN HÀNG / VÍ",
                                    accessor: (acc) => acc.bankCode,
                                    type: "string",
                                    cell: (acc) => (
                                        <div className="flex items-center gap-3">
                                            {(acc.bankLogoUrl || acc.providerLogoUrl) ? (
                                                <div className="w-10 h-10 bg-white rounded-xl border border-border flex items-center justify-center p-1.5 shadow-sm">
                                                    <img
                                                        src={resolveAvatarPreview(acc.bankLogoUrl ?? acc.providerLogoUrl ?? null)}
                                                        alt={acc.bankShortName || acc.providerName}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-[10px] font-black text-primary uppercase">
                                                    {acc.bankCode?.substring(0, 3) || acc.providerCode?.substring(0, 3)}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground text-sm leading-tight">
                                                    {(acc.bankCode && acc.bankName) ? acc.bankName : acc.providerName}
                                                </span>
                                                <span className="text-[10px] text-foreground-muted font-bold uppercase tracking-widest mt-0.5">
                                                    {acc.bankCode || acc.providerCode}
                                                </span>
                                            </div>
                                            {(acc.bankIsActive === false || acc.providerIsActive === false) && (
                                                <span className="px-1.5 py-0.5 bg-danger/10 text-danger font-bold text-[9px] uppercase rounded-md animate-pulse ml-1 border border-danger/20">
                                                    Bảo trì
                                                </span>
                                            )}
                                        </div>
                                    )
                                },
                                {
                                    header: "SỐ TÀI KHOẢN",
                                    accessor: (acc) => acc.accountNumber,
                                    type: "string",
                                    cell: (acc) => <span className="whitespace-nowrap">{acc.accountNumber}</span>
                                },
                                {
                                    header: "PIN",
                                    accessor: (acc) => acc.isPinned,
                                    type: "boolean",
                                    cell: (acc) =>
                                        <ActionButton
                                            icon={<Pin className={cn("w-3.5 h-3.5", acc.isPinned && "fill-amber-500")} />}
                                            onClick={() => handleOpenPin(acc)}
                                            color={acc.isPinned ? "amber" : "gray"}
                                            title={acc.isPinned ? "Bỏ ghim" : "Ghim"}
                                        />
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
                className="hidden lg:flex w-3 cursor-col-resize items-center justify-center hover:bg-border/50 bg-transparent group z-10 transition-colors mx-1 shrink-0"
                onMouseDown={startResizing}
            >
                <div className="h-10 w-1 rounded-full bg-border group-hover:bg-primary transition-colors" />
            </div>

            {/* Right Column: Create QR Form & Result */}
            <div
                className="flex flex-col gap-4 h-full min-h-0 flex-1 min-w-0"
            >

                <div className="flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-foreground">Thông tin tạo mã QR</h2>
                    <button
                        className="p-1.5 text-foreground-secondary hover:text-danger hover:bg-red-50 rounded-md transition-colors"
                        onClick={() => {
                            setFormData({
                                providerId: "",
                                providerCode: undefined,
                                providerName: undefined,
                                napasBin: "",
                                bankCode: "",
                                bankName: "",
                                bankLogo: "",
                                number: "",
                                amount: "",
                                note: ""
                            });
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
                        providerCode={formData.providerCode}
                        providerName={formData.providerName}
                        bankCode={formData.bankCode}
                        bankName={formData.bankName}
                        bankLogo={formData.bankLogo}
                        allProviders={allProviders}
                        onFetchProviders={fetchProviders}
                        onProviderChange={(id) => {
                            if (selectedAccount && id !== selectedAccount.providerId) setSelectedAccount(null);
                            const p = allProviders.find(item => item.id === id);
                            setFormData({
                                ...formData,
                                providerId: id,
                                providerCode: p?.code,
                                providerName: p?.name,
                                napasBin: "",
                                bankCode: "",
                                bankName: "",
                                bankLogo: ""
                            });
                            setIsProviderMaintenance(p ? !p.isActive : false);
                            setIsBankMaintenance(false);
                        }}
                        onBankSelect={(code, name, logo, isActive) => {
                            if (selectedAccount && code !== selectedAccount.bankCode) setSelectedAccount(null);
                            setFormData({ ...formData, napasBin: "", bankCode: code, bankName: name, bankLogo: logo });
                            setIsBankMaintenance(!isActive);
                        }}
                        isProviderInactive={isProviderInactive || false}
                        isBankInactive={isBankInactive || false}
                        allowInactiveSelection={false}
                        layout={leftPercent > 60 ? "vertical" : "horizontal"}
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground-secondary">Số tài khoản / Số điện thoại</label>
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
                        <label className="text-sm font-medium text-foreground-secondary">Số tiền (VNĐ)</label>
                        <input
                            type="number"
                            className="input"
                            placeholder="Nhập số tiền"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-foreground-secondary">Ghi chú (Tùy chọn)</label>
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
