import React, { useState, useEffect, useCallback, useRef } from "react";
import { QrCode, Eraser, BookUser, ChevronRight } from "lucide-react";
import Button from "@/components/UICustoms/Button";
import { accountApi } from "@/services/account-api.service";
import { providerApi } from "@/services/provider-api.service";
import { qrApi } from "@/services/qr-api.service";

import type { AccountRes, PagingVM, PostQrRes, ProviderRes } from "@/models/entity.model";
import type { PostQrReq } from "@/models/entity.request.model";
import { toast } from "react-toastify";
import { formatVNDInput, formatVNDDisplay } from "@/utils/currencyUtils";
import QRDisplay from "@/components/UICustoms/QR/QRDisplay";
import AccountProviderSelector from "@/components/UICustoms/Form/AccountProviderSelector";
import { ProviderCode, QRType } from "@/models/enum";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { useResizable } from "@/hooks/useResizable";
import AccountDrawer from "./components/AccountDrawer";
import FeatureFuture from "@/components/UICustoms/FeatureFuture";

//#region Constants
const DEFAULT_FORM = {
    providerId: "",
    providerCode: "",
    providerName: "",
    isProviderInactive: false,
    napasBin: "" as string | null,
    bankCode: "" as string | null,
    bankShortName: "" as string | null,
    bankName: "" as string | null,
    bankLogoUrl: "" as string | null,
    isBankInactive: null as boolean | null,
    number: "",
    amount: "",
    note: "",
};
//#endregion

const CreatePaymentPage: React.FC = () => {
    //#region States
    const [accounts, setAccounts] = useState<AccountRes[]>([]);
    const [allProviders, setAllProviders] = useState<ProviderRes[]>([]);
    const [hasFetchedProviders, setHasFetchedProviders] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paging, setPaging] = useState<PagingVM<AccountRes>>({
        list: [],
        pageNumber: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
    });
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearch = useDebounce(searchValue, 500);
    const [isProviderMaintenance, setIsProviderMaintenance] = useState(false);
    const [isBankMaintenance, setIsBankMaintenance] = useState(false);

    const [qrResult, setQrResult] = useState<PostQrRes | null>(null);
    const [qrLoading, setQrLoading] = useState(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [providerFilter, setProviderFilter] = useState<string | undefined>(undefined);

    const [selectedAccount, setSelectedAccount] = useState<AccountRes | null>(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [shouldFetchQrStyles, setShouldFetchQrStyles] = useState(false);
    //#endregion

    //#region Refs & Hooks
    const hasFetchedAccounts = useRef(false);
    const lastCreateTimeRef = useRef<number>(0);
    const { containerRef, leftPercent, startResizing } = useResizable(40);
    //#endregion

    //#region Data Fetching
    const fetchProviders = useCallback(async () => {
        if (hasFetchedProviders) return;
        try {
            const res = await providerApi.getAll();
            if (res) {
                setAllProviders(res);
                setHasFetchedProviders(true);
            }
        } catch (error) {
            console.error("Error fetching providers:", error);
        }
    }, [hasFetchedProviders]);

    const fetchAccounts = useCallback(
        async (page: number, size: number, search?: string, providerId?: string) => {
            try {
                setLoading(true);
                const res = await accountApi.getAll({
                    pageNumber: page,
                    pageSize: size,
                    providerId: providerId ?? null,
                    searchValue: search ?? null,
                    isActive: true
                });
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
        },
        []
    );

    useEffect(() => {
        if (!hasFetchedAccounts.current) return;
        fetchAccounts(paging.pageNumber, paging.pageSize, debouncedSearch, providerFilter);
    }, [fetchAccounts, paging.pageNumber, paging.pageSize, debouncedSearch, providerFilter]);
    //#endregion

    //#region Handlers
    const handlePageChange = useCallback((newPage: number) => {
        setPaging((prev) => ({ ...prev, pageNumber: newPage }));
    }, []);

    const handlePageSizeChange = useCallback((newSize: number) => {
        setPaging((prev) => ({ ...prev, pageSize: newSize, pageNumber: 1 }));
    }, []);

    // Derived states for maintenance checks
    const prov = allProviders.find((p) => p.id === formData.providerId);
    const isProviderInactive = prov ? !prov.isActive : formData.providerId ? isProviderMaintenance : false;
    const isBankInactive = isBankMaintenance;

    const handlePinAccount = useCallback(async (acc: AccountRes) => {
        const isCurrentlyPinned = acc.isPinned;
        if (!isCurrentlyPinned) {
            const currentPinnedCount = accounts.filter((a) => a.isPinned).length;
            if (currentPinnedCount >= 5) {
                toast.warning("Bạn chỉ có thể ghim tối đa 5 tài khoản.");
                return;
            }
        }
        try {
            setLoading(true);
            await accountApi.patchIsPinned(acc.id, !isCurrentlyPinned);
            fetchAccounts(paging.pageNumber, paging.pageSize, debouncedSearch, providerFilter);
        } catch (error) {
            console.error("Error toggling pin status:", error);
            toast.error(isCurrentlyPinned ? "Bỏ ghim tài khoản thất bại." : "Ghim tài khoản thất bại.");
        } finally {
            setLoading(false);
        }
    }, [accounts, fetchAccounts, paging.pageNumber, paging.pageSize, debouncedSearch, providerFilter]);

    const handleSelectAccount = useCallback(
        (acc: AccountRes) => {
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
                note: "",
            });
            setIsProviderMaintenance(!acc.providerIsActive);
            setIsBankMaintenance(isBank ? !acc.bankIsActive : false);
            setQrResult(null);
            setIsDrawerOpen(false);
        },
        []
    );

    const handleOpenDrawer = useCallback(() => {
        if (!hasFetchedAccounts.current) {
            hasFetchedAccounts.current = true;
            fetchAccounts(paging.pageNumber, paging.pageSize, debouncedSearch, providerFilter);
        }
        setIsDrawerOpen(true);
    }, [fetchAccounts, paging.pageNumber, paging.pageSize, debouncedSearch, providerFilter]);

    const handleCloseDrawer = useCallback(() => setIsDrawerOpen(false), []);

    const handleCreateQR = useCallback(async () => {
        const now = Date.now();
        if (now - lastCreateTimeRef.current < 3000) {
            toast.warning("Vui lòng đợi 3 giây trước khi thực hiện thao tác tiếp theo.");
            return;
        }

        if (!formData.providerId) {
            toast.warning("Vui lòng chọn loại tài khoản.");
            return;
        }
        if (!formData.number) {
            toast.warning("Vui lòng nhập số tài khoản / số điện thoại.");
            return;
        }

        lastCreateTimeRef.current = now;

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
                bankCode: selectedAccount ? null : isBank ? String(formData.bankCode) : null,
                amount: formData.amount ? Number(formData.amount) : null,
                description: formData.note || null,
                isFixedAmount: !!formData.amount,
            };
            const res = await qrApi.post(req);
            setQrResult(res);
            setShouldFetchQrStyles(true);
            toast.success("Tạo mã QR thành công!");
        } catch (error) {
            console.error("Error creating QR:", error);
            toast.error("Tạo mã QR thất bại.");
        } finally {
            setQrLoading(false);
        }
    }, [formData, selectedAccount, isProviderInactive, isBankInactive]);

    const handleClearForm = useCallback(() => {
        setFormData(DEFAULT_FORM);
        setSelectedAccount(null);
        setQrResult(null);
        setIsProviderMaintenance(false);
        setIsBankMaintenance(false);
    }, []);

    const handleProviderChange = useCallback(
        (id: string) => {
            if (selectedAccount && id !== selectedAccount.providerId) setSelectedAccount(null);
            const p = allProviders.find((item) => item.id === id);
            setFormData((prev) => ({
                ...prev,
                providerId: id,
                providerCode: p?.code ?? "",
                providerName: p?.name ?? "",
                isProviderInactive: false,
                napasBin: "",
                bankCode: "",
                bankShortName: "",
                bankLogoUrl: "",
                isBankInactive: false,
            }));
            setIsProviderMaintenance(p ? !p.isActive : false);
            setIsBankMaintenance(false);
        },
        [allProviders, selectedAccount]
    );

    const handleBankSelect = useCallback(
        (napasBin: string, code: string, shortName: string, bankName: string, logoUrl: string | null, isActive: boolean) => {
            if (selectedAccount && code !== selectedAccount.bankCode) setSelectedAccount(null);
            setFormData((prev) => ({
                ...prev,
                napasBin,
                bankCode: code,
                bankShortName: shortName,
                bankName,
                bankLogoUrl: logoUrl,
                isBankInactive: !isActive,
            }));
            setIsBankMaintenance(!isActive);
        },
        [selectedAccount]
    );

    const handleNumberChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (selectedAccount && e.target.value !== (selectedAccount.accountNumber ?? "")) setSelectedAccount(null);
            setFormData((prev) => ({ ...prev, number: e.target.value }));
        },
        [selectedAccount]
    );

    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        if (raw.length <= 15) {
            setFormData((prev) => ({ ...prev, amount: raw }));
        }
    }, []);

    const handleNoteChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, note: e.target.value }));
    }, []);
    //#endregion

    //#region Render
    return (
        <div ref={containerRef} className="h-full w-full flex bg-bg flex-1 overflow-hidden relative qr-container">
            {/* Account Drawer */}
            <AccountDrawer
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
                accounts={accounts}
                loading={loading}
                paging={paging}
                selectedAccountId={selectedAccount?.id ?? null}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                providerFilter={providerFilter}
                onProviderFilterChange={setProviderFilter}
                allProviders={allProviders}
                onFetchProviders={fetchProviders}
                onSelectAccount={handleSelectAccount}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                handlePinAccount={handlePinAccount}
                onRefresh={() => fetchAccounts(paging.pageNumber, paging.pageSize, debouncedSearch, providerFilter)}
                refreshLoading={loading}
            />

            {/* Left Column: Form Section */}
            <div
                className="flex flex-col gap-lg h-full min-h-0 overflow-y-auto overflow-x-hidden px-lg py-md
                flex-none min-w-[450px] scrollbar-hidden animate-in fade-in 
                slide-in-from-left-4 duration-500"
                style={{ width: `${leftPercent}%` }}
            >
                {/* Header Section */}
                <div className="flex items-start justify-between gap-md shrink-0 mb-sm">
                    <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-extrabold text-foreground tracking-tight whitespace-nowrap">Tạo QR</h1>
                            <button
                                onClick={handleOpenDrawer}
                                className={cn(
                                    "flex items-center gap-sm px-4 py-2 rounded-full text-[10px] font-black border transition-all duration-300 hover:shadow-lg active:scale-95 shrink-0",
                                    selectedAccount
                                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                                        : "bg-surface border-border/60 text-foreground-secondary hover:border-primary/40 hover:text-primary"
                                )}
                                aria-label="Mở danh sách tài khoản"
                            >
                                <BookUser className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[120px] lg:max-w-[180px] uppercase tracking-wider">
                                    {selectedAccount
                                        ? `${selectedAccount.accountHolder || selectedAccount.accountNumber}`
                                        : "CHỌN TỪ DANH SÁCH"}
                                </span>
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                        <p className="text-sm text-foreground-muted font-medium">
                            Nhập thông tin hoặc chọn từ danh sách để tạo mã QR nhanh chóng.
                        </p>
                    </div>

                    <div className="flex items-center">
                        <button
                            className="p-2.5 text-foreground-secondary hover:text-danger hover:bg-danger/5 rounded-xl transition-all duration-300 group"
                            onClick={handleClearForm}
                            aria-label="Xóa thông tin"
                            title="Xóa thông tin"
                        >
                            <Eraser className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                        </button>
                    </div>
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
                        onProviderChange={handleProviderChange}
                        onBankSelect={handleBankSelect}
                        isProviderInactive={isProviderInactive || false}
                        isBankInactive={isBankInactive || null}
                        allowInactiveSelection={false}
                        layout="horizontal"
                    />

                    <div className="flex flex-col gap-sm">
                        <label htmlFor="accountNumber" className="text-sm font-medium text-foreground-secondary">
                            Số tài khoản / Số điện thoại
                        </label>
                        <input
                            id="accountNumber"
                            name="accountNumber"
                            type="text"
                            className="input"
                            placeholder="Nhập số tài khoản hoặc SĐT"
                            value={formData.number}
                            onChange={handleNumberChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                        <div className="flex flex-col gap-sm">
                            <label htmlFor="amount" className="text-sm font-medium text-foreground-secondary">
                                Số tiền
                            </label>
                            <div className="relative group/amount">
                                <input
                                    id="amount"
                                    name="amount"
                                    type="text"
                                    inputMode="numeric"
                                    className="input font-primary pr-12"
                                    placeholder="Nhập số tiền"
                                    autoComplete="off"
                                    value={formatVNDInput(formData.amount)}
                                    onChange={handleAmountChange}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground-muted select-none group-focus-within/amount:text-primary transition-colors border border-border/60 px-1.5 py-0.5 rounded bg-surface-muted/50">
                                    VND
                                </div>
                            </div>
                            {formData.amount && (
                                <p className="text-[10px] font-bold text-foreground-muted/70 px-1 italic animate-in fade-in slide-in-from-top-1 duration-300">
                                    = {formatVNDDisplay(formData.amount)}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-sm">
                            <label htmlFor="note" className="text-sm font-medium text-foreground-secondary">
                                Ghi chú (Tùy chọn)
                            </label>
                            <input
                                id="note"
                                name="note"
                                type="text"
                                className="input"
                                placeholder="Nhập nội dung chuyển khoản"
                                value={formData.note}
                                onChange={handleNoteChange}
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
                            {qrLoading ? "Đang tạo..." : isBankInactive || isProviderInactive ? "ĐANG BẢO TRÌ" : "TẠO QR"}
                        </Button>
                    </div>
                </div>

                {/* History placeholder */}
                <FeatureFuture
                    title="Lịch sử mã QR"
                    description="Chúng tôi đang phát triển tính năng lưu trữ và quản lý lịch sử các mã QR bạn đã tạo."
                />
            </div>

            {/* Resizable Splitter */}
            <div
                className="hidden lg:flex w-1 cursor-col-resize items-center justify-center hover:bg-primary/40 bg-border/20 group z-10 transition-all duration-200 self-stretch shrink-0"
                onMouseDown={startResizing}
            >
                <div className="h-12 w-0.5 rounded-full bg-border group-hover:bg-primary transition-all duration-300" />
            </div>

            {/* Right Column: QR Display */}
            <div
                className="flex flex-col gap-lg h-full min-h-0 overflow-y-auto px-lg py-md
                flex-1 min-w-0 scrollbar-hidden animate-in fade-in 
                slide-in-from-right-4 duration-500"
                style={{ width: `${100 - leftPercent}%` }}
            >
                <h2 className="text-2xl font-extrabold text-foreground shrink-0 mb-sm">Mã QR</h2>
                <div className="flex-1 flex flex-col items-center">
                    <QRDisplay
                        type={QRType.PRIVATE}
                        qrData={qrResult?.qrData}
                        styleJson={qrResult?.styleJson}
                        transactionRef={qrResult?.transactionRef}
                        isWide={leftPercent <= 50}
                        shouldFetchStyles={shouldFetchQrStyles}
                        className="max-w-4xl"
                    />
                </div>
            </div>

        </div>
    );
    //#endregion
};

export default CreatePaymentPage;
