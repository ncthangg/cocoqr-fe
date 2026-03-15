import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { providerApi } from "@/services/provider-api.service";
import type { ProviderRes } from "@/models/entity.model";
import BankSelectionModal from "@/components/UICustoms/Modal/BankSelectionModal";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";

interface AccountProviderSelectorProps {
    providerId: string;
    bankCode: string;
    bankName: string;
    bankLogo?: string | null;
    onProviderChange: (providerId: string) => void;
    onBankSelect: (code: string, name: string, logoUrl: string | null) => void;
    isBankInactive?: boolean;
    layout?: 'vertical' | 'horizontal';
}

const AccountProviderSelector: React.FC<AccountProviderSelectorProps> = ({
    providerId,
    bankCode,
    bankName,
    bankLogo,
    onProviderChange,
    onBankSelect,
    isBankInactive,
    layout = 'vertical'
}) => {
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [allProviders, setAllProviders] = useState<ProviderRes[]>([]);

    useEffect(() => {
        const fetchProviders = async () => {
            try {
                const res = await providerApi.getAll();
                if (res) {
                    setAllProviders(res);
                }
            } catch (error) {
                console.error("Error fetching providers:", error);
            }
        };
        fetchProviders();
    }, []);

    const isHorizontal = layout === 'horizontal';
    const containerClass = isHorizontal ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4";

    const selectedProvider = allProviders.find(p => p.id === providerId);
    const isBank = selectedProvider?.code === "BANK";

    return (
        <div className={containerClass}>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary">Loại tài khoản</label>
                <div className="relative">
                    <select
                        className={`input cursor-pointer appearance-none pr-10 ${selectedProvider && !selectedProvider.isActive ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        value={providerId}
                        onChange={(e) => onProviderChange(e.target.value)}
                    >
                        <option value="" disabled>Chọn loại tài khoản</option>
                        {allProviders.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle pointer-events-none" />
                </div>
                {selectedProvider && !selectedProvider.isActive && (
                    <p className="text-xs text-red-500 font-medium">
                        Phương thức thanh toán đang bảo trì
                    </p>
                )}
            </div>

            {isBank && (
                <div className={`flex flex-col gap-2 relative`}>
                    <label className="text-sm font-medium text-text-secondary">Ngân hàng</label>
                    <div
                        className={`input cursor-pointer flex items-center justify-between min-h-[42px] pr-3 ${isBankInactive ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        onClick={() => setIsBankModalOpen(true)}
                    >
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                            {bankLogo && (
                                <img src={resolveAvatarPreview(bankLogo)} alt="Logo" className="w-6 h-6 object-contain flex-shrink-0" />
                            )}
                            <span className="truncate w-full text-left text-sm">
                                {bankName ? `${bankCode} - ${bankName}` : <span className="text-text-subtle">Chọn ngân hàng</span>}
                            </span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-text-subtle flex-shrink-0" />
                    </div>
                    {isBankInactive && (
                        <p className="text-xs text-red-500 font-medium">
                            Ngân hàng đang bảo trì
                        </p>
                    )}
                </div>
            )}

            {!isHorizontal && !isBank && providerId !== "" && (
                <div className="invisible h-0 overflow-hidden" aria-hidden="true" />
            )}

            {isHorizontal && !isBank && (
                <div className="invisible" aria-hidden="true" />
            )}

            <BankSelectionModal
                isOpen={isBankModalOpen}
                onClose={() => setIsBankModalOpen(false)}
                onSelectBank={(code, name, logo) => {
                    onBankSelect(code, name, logo);
                    setIsBankModalOpen(false);
                }}
            />
        </div>
    );
};

export default AccountProviderSelector;
