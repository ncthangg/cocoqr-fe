import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AccountProvider } from "@/models/enum";
import BankSelectionModal from "@/components/UICustoms/Modal/BankSelectionModal";
import { resolveAvatarPreview } from "@/utils/imageConvertUtils";

interface AccountProviderSelectorProps {
    provider: AccountProvider | "";
    bankCode: string;
    bankName: string;
    bankLogo?: string | null;
    onProviderChange: (provider: AccountProvider | "") => void;
    onBankSelect: (code: string, name: string, logoUrl?: string) => void;
    layout?: 'vertical' | 'horizontal';
}

const AccountProviderSelector: React.FC<AccountProviderSelectorProps> = ({
    provider,
    bankCode,
    bankName,
    bankLogo,
    onProviderChange,
    onBankSelect,
    layout = 'vertical'
}) => {
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);

    const isHorizontal = layout === 'horizontal';
    const containerClass = isHorizontal ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4";

    return (
        <div className={containerClass}>
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-secondary">Loại tài khoản</label>
                <div className="relative">
                    <select
                        className="input cursor-pointer appearance-none pr-10"
                        value={provider}
                        onChange={(e) => onProviderChange(e.target.value === "" ? "" : Number(e.target.value) as AccountProvider)}
                    >
                        <option value="">Chọn loại tài khoản</option>
                        <option value={AccountProvider.BANK}>Ngân hàng</option>
                        <option value={AccountProvider.MOMO}>Ví MoMo</option>
                        <option value={AccountProvider.VNPAY}>Ví VNPay</option>
                        <option value={AccountProvider.ZALOPAY}>Ví ZaloPay</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-subtle pointer-events-none" />
                </div>
            </div>

            {provider === AccountProvider.BANK && (
                <div className={`flex flex-col gap-2 relative`}>
                    <label className="text-sm font-medium text-text-secondary">Ngân hàng</label>
                    <div 
                        className="input cursor-pointer flex items-center justify-between min-h-[42px] pr-3" 
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
                </div>
            )}

            {!isHorizontal && provider !== AccountProvider.BANK && provider !== "" && (
                <div className="invisible h-0 overflow-hidden" aria-hidden="true" />
            )}

            {isHorizontal && provider !== AccountProvider.BANK && (
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
