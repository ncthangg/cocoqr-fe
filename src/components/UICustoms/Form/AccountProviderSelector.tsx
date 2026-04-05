import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { ChevronDown } from 'lucide-react';
import type { BankRes, ProviderRes } from "@/models/entity.model";
import { ProviderCode } from '@/models/enum';
import { bankApi } from '@/services/bank-api.service';
import BrandLogo from '@/components/UICustoms/BrandLogo';

const BankSelectionModal = lazy(() => import("@/components/UICustoms/Modal/BankSelectionModal"));

interface AccountProviderSelectorProps {
    providerId: string;
    providerCode?: string;
    providerName?: string;
    napasBin?: string | null;
    bankCode?: string | null;
    bankShortName?: string | null;
    bankLogoUrl?: string | null;
    allProviders: ProviderRes[];
    onFetchProviders: () => void;
    onProviderChange: (providerId: string) => void;
    onBankSelect: (napasBin: string, code: string, shortName: string, bankName: string, logoUrl: string | null, isActive: boolean) => void;
    isBankInactive?: boolean | null;
    isProviderInactive?: boolean;
    allowInactiveSelection?: boolean;
    layout?: 'vertical' | 'horizontal';
    bankSelectionMode?: 'modal' | 'dropdown';
}

const AccountProviderSelector: React.FC<AccountProviderSelectorProps> = ({
    providerId,
    providerCode,
    providerName,
    napasBin,
    bankCode,
    bankShortName,
    bankLogoUrl,
    allProviders,
    onFetchProviders,
    onProviderChange,
    onBankSelect,
    isBankInactive,
    isProviderInactive,
    allowInactiveSelection = true,
    layout = 'vertical',
    bankSelectionMode = 'modal',
}) => {
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);

    const isHorizontal = layout === 'horizontal';
    const containerClass = isHorizontal ? "grid grid-cols-2 gap-md" : "flex flex-col gap-md";

    const selectedProvider = allProviders.find(p => p.id === providerId);
    const isBank = selectedProvider ? selectedProvider.code === ProviderCode.BANK : providerCode === ProviderCode.BANK;

    return (
        <div className={containerClass}>
            <div className="flex flex-col gap-sm">
                <label className="text-sm font-medium text-foreground-secondary">Loại tài khoản</label>
                <div className="relative">
                    <select
                        className={`input cursor-pointer appearance-none pr-10 h-11 ${selectedProvider && !selectedProvider.isActive ? 'border-danger focus:border-danger focus:ring-danger' : ''}`}
                        value={providerId}
                        onChange={(e) => onProviderChange(e.target.value)}
                        onMouseDown={() => onFetchProviders()}
                    >
                        <option value="" disabled hidden>Loại tài khoản</option>
                        {allProviders.length === 0 && providerId !== "" && (
                            <option value={providerId}>{providerName || (isBank ? ProviderCode.BANK : "")}</option>
                        )}
                        {allProviders.map(p => (
                            <option key={p.id} value={p.id} disabled={!p.isActive && !allowInactiveSelection}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted pointer-events-none" />
                </div>
                {isProviderInactive && (
                    <p className="text-xs text-danger font-medium">
                        Phương thức thanh toán đang bảo trì
                    </p>
                )}
            </div>

            {isBank && bankSelectionMode === 'modal' && (
                <BankFieldModal
                    napasBin={napasBin ?? ""}
                    bankCode={bankCode ?? ""}
                    bankShortName={bankShortName ?? ""}
                    isBankInactive={isBankInactive ?? false}
                    logoUrl={bankLogoUrl ?? null}
                    isBankModalOpen={isBankModalOpen}
                    onOpenModal={() => setIsBankModalOpen(true)}
                    onCloseModal={() => setIsBankModalOpen(false)}
                    onBankSelect={onBankSelect}
                    allowInactiveSelection={allowInactiveSelection}
                />
            )}

            {isBank && bankSelectionMode === 'dropdown' && (
                <BankFieldDropdown
                    napasBin={napasBin ?? ""}
                    bankCode={bankCode ?? ""}
                    bankShortName={bankShortName ?? ""}
                    isBankInactive={isBankInactive ?? false}
                    logoUrl={bankLogoUrl ?? null}
                    onBankSelect={onBankSelect}
                />
            )}

            {!isHorizontal && !isBank && providerId !== "" && (
                <div className="invisible h-0 overflow-hidden" aria-hidden="true" />
            )}

            {isHorizontal && !isBank && (
                <div className="invisible" aria-hidden="true" />
            )}
        </div>
    );
};

interface BankFieldModalProps {
    napasBin: string;
    bankCode: string;
    bankShortName: string;
    isBankInactive: boolean;
    logoUrl: string | null;
    isBankModalOpen: boolean;
    onOpenModal: () => void;
    onCloseModal: () => void;
    onBankSelect: (napasBin: string, code: string, shortName: string, bankName: string, logoUrl: string | null, isActive: boolean) => void;
    allowInactiveSelection: boolean;
}

const BankFieldModal: React.FC<BankFieldModalProps> = ({
    napasBin, bankCode, bankShortName, isBankInactive, logoUrl,
    isBankModalOpen, onOpenModal, onCloseModal,
    onBankSelect, allowInactiveSelection,
}) => (
    <div className="flex flex-col gap-sm relative">
        <label className="text-sm font-medium text-foreground-secondary">Ngân hàng</label>
        <div
            className={`input cursor-pointer flex items-center justify-between h-11 pr-3 ${isBankInactive ? 'border-danger focus:border-danger focus:ring-danger' : ''}`}
            onClick={onOpenModal}
        >
            <div className="flex items-center gap-sm overflow-hidden w-full">
                <span className="truncate w-full text-left text-sm">
                    {
                        bankCode ? (
                            <div className="flex items-center gap-md">
                                <BrandLogo
                                    logoUrl={logoUrl}
                                    name={bankShortName}
                                    code={bankCode}
                                    size="sm"
                                />
                                <span className="truncate">
                                    ({napasBin}) {bankShortName}
                                </span>
                            </div>
                        )
                            : <span className="text-foreground-muted">Chọn ngân hàng</span>
                    }
                </span>
            </div>
            <ChevronDown className="w-4 h-4 text-foreground-muted flex-shrink-0" />
        </div>
        {isBankInactive && (
            <p className="text-xs text-danger font-medium">Ngân hàng đang bảo trì</p>
        )}
        {isBankModalOpen && (
            <Suspense fallback={null}>
                <BankSelectionModal
                    isOpen={isBankModalOpen}
                    onClose={onCloseModal}
                    onSelectBank={(napasBin, bankCode, bankShortName, bankName, logoUrl, isActive) => {
                        onBankSelect(napasBin, bankCode, bankShortName, bankName, logoUrl, isActive);
                        onCloseModal();
                    }}
                    allowInactiveSelection={allowInactiveSelection}
                />
            </Suspense>
        )}
    </div>
);

interface BankFieldDropdownProps {
    napasBin: string;
    bankCode: string;
    bankShortName: string;
    isBankInactive: boolean;
    logoUrl: string | null;
    onBankSelect: (napasBin: string, code: string, shortName: string, bankName: string, logoUrl: string | null, isActive: boolean) => void;
}

const BankFieldDropdown: React.FC<BankFieldDropdownProps> = ({
    napasBin,
    bankCode,
    bankShortName,
    isBankInactive,
    logoUrl,
    onBankSelect,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [banks, setBanks] = useState<BankRes[]>([]);
    const [hasFetched, setHasFetched] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const fetchBanks = useCallback(async () => {
        if (hasFetched) return;
        try {
            const res = await bankApi.getAll({ pageNumber: 1, pageSize: 200, sortField: null, sortDirection: null, isActive: true, searchValue: null, status: null });
            if (res?.list) {
                setBanks(res.list);
                setHasFetched(true);
            }
        } catch {
            setHasFetched(true);
        }
    }, [hasFetched]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleOpen = () => {
        fetchBanks();
        setIsOpen(true);
        setSearch("");
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const filtered = banks.filter(b => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            b.bankCode.toLowerCase().includes(q) ||
            (b.napasBin?.toLowerCase().includes(q))
        );
    });

    const handleInputClick = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

    return (
        <div className="flex flex-col gap-sm relative" ref={containerRef}>
            <label className="text-sm font-medium text-foreground-secondary">Ngân hàng</label>
            <div
                className={`input cursor-pointer flex items-center justify-between h-11 pr-3 ${isBankInactive ? 'border-danger focus:border-danger focus:ring-danger' : ''}`}
                onClick={handleOpen}
            >
                <span className="truncate w-full text-left text-sm">
                    {
                        napasBin ? (
                            <div className="flex items-center gap-md">
                                <BrandLogo
                                    logoUrl={logoUrl}
                                    name={bankShortName}
                                    code={bankCode}
                                    size="sm"
                                />
                                <span className="truncate">
                                    ({napasBin}) {bankShortName}
                                </span>
                            </div>
                        )
                            : <span className="text-foreground-muted">Chọn ngân hàng</span>
                    }
                </span>
                <ChevronDown className={`w-4 h-4 text-foreground-muted flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isBankInactive && (
                <p className="text-xs text-danger font-medium">Ngân hàng đang bảo trì</p>
            )}

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-xs z-dropdown bg-surface border border-border rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="p-sm border-b border-border">
                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                className="input pl-xl text-sm"
                                placeholder="Tìm theo BIN hoặc mã NH..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={handleInputClick}
                            />
                        </div>
                    </div>
                    <ul className="max-h-[240px] overflow-y-auto">
                        {filtered.length === 0 && (
                            <li className="px-md py-sm text-sm text-foreground-muted text-center">
                                Không tìm thấy ngân hàng
                            </li>
                        )}
                        {filtered.map(b => (
                            <li
                                key={b.id}
                                className={`flex items-center gap-sm px-md py-sm cursor-pointer transition-colors hover:bg-surface-muted ${b.bankCode === bankCode ? 'bg-primary/5 font-semibold' : ''}`}
                                onClick={() => {
                                    onBankSelect(b.napasBin, b.bankCode, b.shortName, b.bankName, b.logoUrl ?? null, b.isActive);
                                    setIsOpen(false);
                                }}
                            >
                                <span className="text-sm font-primary text-foreground-secondary shrink-0">
                                    ({b.napasBin})
                                </span>
                                <span className="text-sm text-foreground font-medium">
                                    {b.shortName}
                                </span>
                                {!b.isActive && (
                                    <span className="ml-auto text-xs text-danger font-bold shrink-0">Bảo trì</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AccountProviderSelector;
