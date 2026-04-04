import { useState, useCallback, useEffect } from "react";
import { QrCode, Eraser, Hash, Banknote, StickyNote } from "lucide-react";
import Button from "@/components/UICustoms/Button";
import AccountProviderSelector from "@/components/UICustoms/Form/AccountProviderSelector";
import { providerApi } from "@/services/provider-api.service";
import type { PostQrRes, ProviderRes } from "@/models/entity.model";
import type { PostQrReq } from "@/models/entity.request.model";
import { toast } from "react-toastify";
import { ProviderCode } from "@/models/enum";
import { qrApi } from "@/services/qr-api.service";
import { formatVNDInput } from "@/utils/currencyUtils";

const defaultForm = {
    providerId: "",
    providerCode: "",
    providerName: "",
    isProviderInactive: null as boolean | null,
    napasBin: "",
    bankCode: "",
    bankName: "",
    bankShortName: "",
    bankLogoUrl: "" as string | null,
    isBankInactive: null as boolean | null,
    number: "",
    amount: "", // raw digits
    note: "",
};

interface HeroQRFormProps {
    onQrCreated?: (res: PostQrRes) => void;
    onReset?: () => void;
}

export function HeroQRForm({ onQrCreated, onReset }: HeroQRFormProps) {
    const [allProviders, setAllProviders] = useState<ProviderRes[]>([]);
    const [hasFetchedProviders, setHasFetchedProviders] = useState(false);
    const [formData, setFormData] = useState(defaultForm);
    const [isProviderMaintenance, setIsProviderMaintenance] = useState(false);
    const [isBankMaintenance, setIsBankMaintenance] = useState(false);

    const [qrLoading, setQrLoading] = useState(false);

    const fetchProviders = useCallback(async () => {
        if (hasFetchedProviders) return;
        try {
            const res = await providerApi.getAll();
            if (res) {
                setAllProviders(res);
                setHasFetchedProviders(true);
            }
        } catch {
            setHasFetchedProviders(true);
        }
    }, [hasFetchedProviders]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    const prov = allProviders.find(p => p.id === formData.providerId);
    const isProviderInactive = prov ? !prov.isActive : (formData.providerId ? isProviderMaintenance : false);
    const isBankInactive = isBankMaintenance;

    const handleReset = () => {
        setFormData(defaultForm);
        setIsProviderMaintenance(false);
        setIsBankMaintenance(false);
        if (onReset) onReset();
    };

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
        if (isBankInactive) {
            toast.warning("Ngân hàng này hiện đang bảo trì.");
            return;
        }
        try {
            setQrLoading(true);
            const req: PostQrReq = {
                providerId: formData.providerId,
                accountId: null,
                accountNumber: formData.number,
                bankCode: isBank ? String(formData.bankCode) : null,
                amount: formData.amount ? Number(formData.amount) : null,
                description: formData.note || null,
                isFixedAmount: !!formData.amount,
            };
            const res = await qrApi.post(req);
            if (onQrCreated) {
                onQrCreated(res);
            }
            toast.success("Tạo mã QR thành công!");
        } catch (error) {
            console.error("Error creating QR:", error);
            toast.error("Tạo mã QR thất bại.");
        } finally {
            setQrLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-md w-full h-full">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0 h-11">
                <h2 className="text-xl font-bold text-foreground">Thông tin tạo mã QR</h2>
                <button
                    type="button"
                    className="p-sm text-foreground-muted hover:text-danger hover:bg-danger/5 rounded-md transition-all duration-300"
                    onClick={handleReset}
                    aria-label="Xóa thông tin form"
                    title="Xóa thông tin"
                >
                    <Eraser className="w-5 h-5" />
                </button>
            </div>

            {/* Form card */}
            <div className="card p-lg flex flex-col gap-md bg-surface/80 backdrop-blur-sm border-border/60 shadow-lg flex-1 group hover:border-primary/20 transition-all duration-500 animate-in fade-in slide-in-from-left-4">
                <AccountProviderSelector
                    providerId={formData.providerId}
                    providerCode={formData.providerCode}
                    providerName={formData.providerName}
                    napasBin={formData.napasBin}
                    bankCode={formData.bankCode}
                    bankShortName={formData.bankShortName}
                    bankLogoUrl={formData.bankLogoUrl}
                    allProviders={allProviders}
                    onFetchProviders={fetchProviders}
                    onProviderChange={(id) => {
                        const p = allProviders.find(item => item.id === id);
                        setFormData({
                            ...formData,
                            providerId: id,
                            providerCode: p?.code || "",
                            providerName: p?.name || "",
                            napasBin: "",
                            bankCode: "",
                            bankName: "",
                            bankLogoUrl: "",
                        });
                        setIsProviderMaintenance(p ? !p.isActive : false);
                        setIsBankMaintenance(false);
                    }}
                    onBankSelect={(napasBin, code, shortName, bankName, logoUrl, isActive) => {
                        setFormData({ ...formData, napasBin: napasBin, bankCode: code, bankShortName: shortName, bankName: bankName, bankLogoUrl: logoUrl, isBankInactive: !isActive });
                        setIsBankMaintenance(!isActive);
                    }}
                    isProviderInactive={isProviderInactive || false}
                    isBankInactive={isBankInactive || false}
                    allowInactiveSelection={false}
                    layout="horizontal"
                    bankSelectionMode="dropdown"
                />

                <div className="flex flex-col gap-sm">
                    <label
                        htmlFor="hero-account-number"
                        className="text-sm font-medium text-foreground-secondary flex items-center gap-xs"
                    >
                        <Hash className="w-4 h-4" />
                        Số tài khoản / Số điện thoại
                    </label>
                    <input
                        id="hero-account-number"
                        name="accountNumber"
                        type="text"
                        className="input"
                        placeholder="Nhập số tài khoản hoặc SĐT"
                        value={formData.number}
                        onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                        required
                    />
                </div>

                <div className="flex flex-col gap-xs">
                    <label
                        htmlFor="hero-amount"
                        className="text-sm font-medium text-foreground-secondary flex items-center gap-xs"
                    >
                        <Banknote className="w-4 h-4 text-primary" />
                        Số tiền
                    </label>
                    <div className="relative group/amount">
                        <input
                            id="hero-amount"
                            name="amount"
                            type="text"
                            inputMode="numeric"
                            className="input font-mono pr-12 text-sm sm:text-base tracking-tight"
                            placeholder="Ví dụ: 300.000"
                            autoComplete="off"
                            value={formatVNDInput(formData.amount)}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                if (raw.length <= 15) { // Limit to reasonable VND length
                                    setFormData({ ...formData, amount: raw });
                                }
                            }}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground-muted select-none group-focus-within/amount:text-primary transition-colors border border-border/60 px-1.5 py-0.5 rounded bg-surface-muted/50">
                            VND
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-sm">
                    <label
                        htmlFor="hero-note"
                        className="text-sm font-medium text-foreground-secondary flex items-center gap-xs"
                    >
                        <StickyNote className="w-4 h-4" />
                        Ghi chú (Tùy chọn)
                    </label>
                    <input
                        id="hero-note"
                        name="note"
                        type="text"
                        className="input"
                        placeholder="Nhập nội dung chuyển khoản"
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    />
                </div>

                {(isProviderInactive || isBankInactive) && (
                    <div className="p-md bg-danger/5 border border-danger/20 rounded-lg animate-in fade-in duration-300">
                        <p className="text-xs text-danger font-medium leading-relaxed">
                            {isProviderInactive
                                ? "Phương thức thanh toán này hiện đang bảo trì. Vui lòng chọn phương thức thanh toán khác."
                                : "Ngân hàng đang bảo trì. Vui lòng chọn ngân hàng khác."}
                        </p>
                    </div>
                )}

                <div className="flex gap-md mt-sm">
                    <Button
                        size="large"
                        className="flex-1 btn-primary flex items-center justify-center gap-md hover:scale-[1.01] transition-all duration-300"
                        onClick={handleCreateQR}
                        disabled={qrLoading || isBankInactive || isProviderInactive}
                    >
                        <QrCode className="w-5 h-5" />
                        <span className="font-bold tracking-wide">
                            {qrLoading ? "ĐANG TẠO..." : (isBankInactive || isProviderInactive) ? "ĐANG BẢO TRÌ" : "TẠO MÃ QR"}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
