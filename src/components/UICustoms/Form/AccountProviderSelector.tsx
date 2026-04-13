import React, { useState, useCallback, lazy, Suspense } from 'react';
import { ChevronDown } from 'lucide-react';
import type { BankRes, ProviderRes } from "@/models/entity.model";
import { ProviderCode } from '@/models/enum';
import { bankApi } from '@/services/bank-api.service';
import BrandLogo from '@/components/UICustoms/BrandLogo';
import SearchableDropdown from '@/components/UICustoms/Form/SearchableDropdown';

const BankSelectionModal = lazy(() => import("@/components/UICustoms/Modal/BankSelectionModal"));

//#region Types
interface AccountProviderSelectorProps {
    providerId: string;
    providerCode?: string;
    providerName?: string;
    napasBin?: string | null;
    bankCode?: string | null;
    bankShortName?: string | null;
    bankLogoUrl?: string | null;
    allProviders: ProviderRes[];
    onFetchProviders: () => Promise<void> | void;
    onProviderChange: (providerId: string) => void;
    onBankSelect: (napasBin: string, code: string, shortName: string, bankName: string, logoUrl: string | null, isActive: boolean) => void;
    isBankInactive?: boolean | null;
    isProviderInactive?: boolean;
    allowInactiveSelection?: boolean;
    layout?: 'vertical' | 'horizontal';
    bankSelectionMode?: 'modal' | 'dropdown';
}
//#endregion

//#region Provider Dropdown Option
interface ProviderOption {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    disabled?: boolean;
}

const providerFilterFn = (option: ProviderOption, query: string): boolean => {
    return option.name.toLowerCase().includes(query);
};
//#endregion

//#region Bank Dropdown Option
interface BankOption {
    id: string;
    napasBin: string;
    bankCode: string;
    bankName: string;
    shortName: string;
    logoUrl?: string;
    isActive: boolean;
    disabled?: boolean;
}

const bankFilterFn = (option: BankOption, query: string): boolean => {
    return (
        option.bankCode.toLowerCase().includes(query) ||
        option.napasBin?.toLowerCase().includes(query) ||
        option.shortName?.toLowerCase().includes(query) ||
        false
    );
};
//#endregion

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

    //#region Provider dropdown helpers
    const providerOptions: ProviderOption[] = allProviders.map(p => ({
        id: p.id,
        name: p.name,
        code: p.code,
        isActive: p.isActive,
        disabled: !p.isActive && !allowInactiveSelection,
    }));

    // When editing an existing record and providers haven't been fetched yet,
    // show a placeholder option so the trigger isn't blank.
    const providerOptionsWithFallback: ProviderOption[] =
        providerOptions.length === 0 && providerId !== ""
            ? [{
                id: providerId,
                name: providerName || (providerCode === ProviderCode.BANK ? ProviderCode.BANK : ""),
                code: providerCode || "",
                isActive: true,
            }]
            : providerOptions;

    const handleProviderSelect = useCallback((option: ProviderOption) => {
        onProviderChange(option.id);
    }, [onProviderChange]);

    const renderProviderValue = useCallback(
        (option: ProviderOption | undefined) => {
            if (!option) return null;
            return <span className="truncate">{option.name}</span>;
        },
        []
    );

    const renderProviderOption = useCallback(
        (option: ProviderOption) => (
            <>
                <span className="text-sm text-foreground font-medium truncate">
                    {option.name}
                </span>
                {!option.isActive && (
                    <span className="ml-auto text-xs text-danger font-bold shrink-0">
                        Bảo trì
                    </span>
                )}
            </>
        ),
        []
    );
    //#endregion

    return (
        <div className={containerClass}>
            {/* Provider selector dropdown */}
            <SearchableDropdown<ProviderOption>
                id="provider-selector"
                label="Loại tài khoản"
                placeholder="Loại tài khoản"
                value={providerId}
                options={providerOptionsWithFallback}
                onFetch={onFetchProviders}
                onSelect={handleProviderSelect}
                renderValue={renderProviderValue}
                renderOption={renderProviderOption}
                filterFn={providerFilterFn}
                searchable={false}
                hasError={!!(selectedProvider && !selectedProvider.isActive)}
                errorMessage={isProviderInactive ? "Phương thức thanh toán đang bảo trì" : undefined}
                emptyText="Không tìm thấy loại tài khoản"
            />

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

//#region BankFieldModal (unchanged)
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
}) => {
    const [hasOpenedBankModal, setHasOpenedBankModal] = useState(false);

    const handleOpen = () => {
        setHasOpenedBankModal(true);
        onOpenModal();
    };

    return (
        <div className="flex flex-col gap-sm relative">
            <label className="text-sm font-medium text-foreground-secondary">Ngân hàng</label>
            <div
                className={`input cursor-pointer flex items-center justify-between h-11 pr-3 ${isBankInactive ? 'border-danger focus:border-danger focus:ring-danger' : ''}`}
                onClick={handleOpen}
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
            {hasOpenedBankModal && (
                <Suspense fallback={null}>
                    <BankSelectionModal
                        isOpen={isBankModalOpen}
                        onClose={onCloseModal}
                        onSelectBank={(napasBin: string, bankCode: string, bankShortName: string, bankName: string, logoUrl: string | null, isActive: boolean) => {
                            onBankSelect(napasBin, bankCode, bankShortName, bankName, logoUrl, isActive);
                            onCloseModal();
                        }}
                        allowInactiveSelection={allowInactiveSelection}
                    />
                </Suspense>
            )}
        </div>
    );
};
//#endregion

//#region BankFieldDropdown — now powered by SearchableDropdown
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
    const [banks, setBanks] = useState<BankRes[]>([]);

    const fetchBanks = useCallback(async () => {
        try {
            const res = await bankApi.getAll({ pageNumber: 1, pageSize: 200, sortField: null, sortDirection: null, isActive: true, searchValue: null, status: null });
            if (res?.list) {
                setBanks(res.list);
            }
        } catch {
            // silently ignore — hasFetched is tracked by SearchableDropdown
        }
    }, []);

    const bankOptions: BankOption[] = banks.map(b => ({
        id: b.id,
        napasBin: b.napasBin,
        bankCode: b.bankCode,
        bankName: b.bankName,
        shortName: b.shortName,
        logoUrl: b.logoUrl,
        isActive: b.isActive,
    }));

    // Build a synthetic selected value id from the current bankCode
    // because the parent tracks bankCode, not bank id.
    const selectedBankId = banks.find(b => b.bankCode === bankCode)?.id ?? "";

    const handleBankSelect = useCallback((option: BankOption) => {
        onBankSelect(option.napasBin, option.bankCode, option.shortName, option.bankName, option.logoUrl ?? null, option.isActive);
    }, [onBankSelect]);

    const renderBankValue = useCallback(
        (option: BankOption | undefined) => {
            // When the bank hasn't been fetched yet but we have napasBin from the parent
            if (!option && napasBin) {
                return (
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
                );
            }
            if (!option) return null;
            return (
                <div className="flex items-center gap-md">
                    <BrandLogo
                        logoUrl={option.logoUrl ?? null}
                        name={option.shortName}
                        code={option.bankCode}
                        size="sm"
                    />
                    <span className="truncate">
                        ({option.napasBin}) {option.shortName}
                    </span>
                </div>
            );
        },
        [napasBin, bankShortName, bankCode, logoUrl]
    );

    const renderBankOption = useCallback(
        (option: BankOption, _isSelected: boolean) => (
            <>
                <span className="text-sm font-primary text-foreground-secondary shrink-0">
                    ({option.napasBin})
                </span>
                <span className="text-sm text-foreground font-medium">
                    {option.shortName}
                </span>
                {!option.isActive && (
                    <span className="ml-auto text-xs text-danger font-bold shrink-0">Bảo trì</span>
                )}
            </>
        ),
        []
    );

    return (
        <SearchableDropdown<BankOption>
            id="bank-selector"
            label="Ngân hàng"
            placeholder="Chọn ngân hàng"
            value={napasBin ? (selectedBankId || napasBin) : ""}
            options={bankOptions}
            onFetch={fetchBanks}
            onSelect={handleBankSelect}
            renderValue={renderBankValue}
            renderOption={renderBankOption}
            filterFn={bankFilterFn}
            searchPlaceholder="Tìm theo BIN hoặc mã NH..."
            searchable={true}
            emptyText="Không tìm thấy ngân hàng"
            hasError={isBankInactive}
            errorMessage={isBankInactive ? "Ngân hàng đang bảo trì" : undefined}
        />
    );
};
//#endregion


export default AccountProviderSelector;
