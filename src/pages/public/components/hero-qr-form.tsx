import { useState, useCallback, useRef, memo } from "react";
import { QrCode, Eraser, Hash, Banknote, StickyNote } from "lucide-react";
import Button from "@/components/UICustoms/Button";
import AccountProviderSelector from "@/components/UICustoms/Form/AccountProviderSelector";
import { providerApi } from "@/services/provider-api.service";
import type { PostQrRes } from "@/models/entity.model";
import type { PostQrReq } from "@/models/entity.request.model";
import { toast } from "react-toastify";
import { ProviderCode } from "@/models/enum";
import { qrApi } from "@/services/qr-api.service";
import { formatVNDInput } from "@/utils/currencyUtils";
import { Link } from "react-router-dom";
import { RouteConstant } from "@/constants/route.constant";
import { useAppDispatch, useAppSelector } from "@/store/redux.hooks";
import {
    setFormData,
    setAllProviders,
    setHasFetchedProviders,
    setIsAgreed,
    setIsProviderMaintenance,
    setIsBankMaintenance,
    resetHeroForm,
} from "@/store/slices/hero-form.slice";

//#region Types & Constants
interface HeroQRFormProps {
    onQrCreated?: (res: PostQrRes) => void;
    onReset?: () => void;
}
//#endregion

//#region Sub-components
const FormLabel = memo(({ htmlFor, icon: Icon, children }: { htmlFor: string; icon: any; children: React.ReactNode }) => (
    <label
        htmlFor={htmlFor}
        className="text-sm font-primary font-medium text-foreground-secondary flex items-center gap-xs select-none cursor-default"
    >
        <Icon className="w-4 h-4" />
        {children}
    </label>
));

const TermsAgreement = memo(({ isAgreed, onChange }: { isAgreed: boolean; onChange: (val: boolean) => void }) => (
    <div className="flex items-center gap-sm select-none px-xs py-xs bg-primary/5 rounded-lg border border-primary/10 transition-colors hover:bg-primary/10">
        <input
            id="hero-terms-agree"
            type="checkbox"
            checked={isAgreed}
            onChange={(e) => onChange(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer transition-all"
        />
        <label htmlFor="hero-terms-agree" className="text-xs text-foreground-secondary cursor-pointer leading-tight">
            Tôi đã đọc & hiểu rõ {" "}
            <Link 
                to={RouteConstant.COMMITMENT} 
                className="text-primary hover:underline font-bold transition-opacity hover:opacity-80"
            >
                Cam kết
            </Link>
            {" "} & {" "}
            <Link 
                to={RouteConstant.GUIDE} 
                className="text-primary hover:underline font-bold transition-opacity hover:opacity-80"
            >
                HDSD
            </Link>
        </label>
    </div>
));
//#endregion

export function HeroQRForm({ onQrCreated, onReset }: HeroQRFormProps) {
    //#region States & Refs
    const dispatch = useAppDispatch();
    const {
        formData,
        allProviders,
        hasFetchedProviders,
        isAgreed,
        isProviderMaintenance,
        isBankMaintenance,
    } = useAppSelector((state) => state.heroForm);

    const [qrLoading, setQrLoading] = useState(false);
    const lastCreateTimeRef = useRef<number>(0);
    //#endregion

    //#region Derived Data
    const prov = allProviders.find(p => p.id === formData.providerId);
    const isProviderInactive = prov ? !prov.isActive : (formData.providerId ? isProviderMaintenance : false);
    const isBankInactive = isBankMaintenance;
    const canCreate = isAgreed && !qrLoading && !isBankInactive && !isProviderInactive;
    //#endregion

    //#region Handlers
    const fetchProviders = useCallback(async () => {
        if (hasFetchedProviders) return;
        try {
            const res = await providerApi.getAll();
            if (res) {
                dispatch(setAllProviders(res));
            }
        } catch {
            // Silently fail as in original logic
        } finally {
            dispatch(setHasFetchedProviders(true));
        }
    }, [hasFetchedProviders, dispatch]);

    const handleReset = useCallback(() => {
        dispatch(resetHeroForm());
        onReset?.();
    }, [onReset, dispatch]);

    const handleCreateQR = useCallback(async () => {
        const now = Date.now();
        if (now - lastCreateTimeRef.current < 5000) {
            toast.warning("Vui lòng đợi 5 giây trước khi thực hiện thao tác tiếp theo.");
            return;
        }

        if (!isAgreed) {
            toast.warning("Vui lòng xác nhận đã đọc cam kết và hướng dẫn.");
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
        const selectedProvider = allProviders.find(p => p.id === formData.providerId);
        const isBank = selectedProvider?.code === ProviderCode.BANK;
        
        if (isBank && !formData.bankCode) {
            toast.warning("Vui lòng chọn ngân hàng.");
            return;
        }
        
        if (isProviderInactive || isBankInactive) {
            toast.warning("Dịch vụ này hiện đang bảo trì.");
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
            onQrCreated?.(res);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi tạo mã QR.");
        } finally {
            setQrLoading(false);
        }
    }, [formData, allProviders, isProviderInactive, isBankInactive, isAgreed, onQrCreated]);

    const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        if (raw.length <= 15) {
            dispatch(setFormData({ amount: raw }));
        }
    }, [dispatch]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        dispatch(setFormData({ [name]: value }));
    }, [dispatch]);
    //#endregion

    //#region Render
    return (
        <div className="flex flex-col gap-md w-full h-full">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0 h-11 select-none">
                <h2 className="text-xl font-secondary font-bold text-foreground cursor-default">Thông tin tạo mã QR</h2>
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
                        dispatch(setFormData({
                            providerId: id,
                            providerCode: p?.code || "",
                            providerName: p?.name || "",
                            napasBin: "",
                            bankCode: "",
                            bankName: "",
                            bankLogoUrl: "",
                        }));
                        dispatch(setIsProviderMaintenance(p ? !p.isActive : false));
                        dispatch(setIsBankMaintenance(false));
                    }}
                    onBankSelect={(napasBin, code, shortName, bankName, logoUrl, isActive) => {
                        dispatch(setFormData({ 
                            napasBin, 
                            bankCode: code, 
                            bankShortName: shortName, 
                            bankName, 
                            bankLogoUrl: logoUrl, 
                            isBankInactive: !isActive 
                        }));
                        dispatch(setIsBankMaintenance(!isActive));
                    }}
                    isProviderInactive={isProviderInactive || false}
                    isBankInactive={isBankInactive || false}
                    allowInactiveSelection={false}
                    layout="horizontal"
                    bankSelectionMode="dropdown"
                />

                <div className="flex flex-col gap-sm">
                    <FormLabel htmlFor="hero-account-number" icon={Hash}>
                        Số tài khoản / Số điện thoại
                    </FormLabel>
                    <input
                        id="hero-account-number"
                        name="number"
                        type="text"
                        className="input"
                        placeholder="Nhập số tài khoản hoặc SĐT"
                        value={formData.number}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="flex flex-col gap-xs">
                    <FormLabel htmlFor="hero-amount" icon={Banknote}>
                        Số tiền
                    </FormLabel>
                    <div className="relative group/amount">
                        <input
                            id="hero-amount"
                            name="amount"
                            type="text"
                            inputMode="numeric"
                            className="input font-primary pr-12 text-sm sm:text-base tracking-tight"
                            placeholder="Ví dụ: 300.000"
                            autoComplete="off"
                            value={formatVNDInput(formData.amount)}
                            onChange={handleAmountChange}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-foreground-muted select-none group-focus-within/amount:text-primary transition-colors border border-border/60 px-1.5 py-0.5 rounded bg-surface-muted/50">
                            VND
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-sm">
                    <FormLabel htmlFor="hero-note" icon={StickyNote}>
                        Ghi chú (Tùy chọn)
                    </FormLabel>
                    <input
                        id="hero-note"
                        name="note"
                        type="text"
                        className="input"
                        placeholder="Nhập nội dung chuyển khoản"
                        value={formData.note}
                        onChange={handleInputChange}
                    />
                </div>

                {(isProviderInactive || isBankInactive) && (
                    <div className="p-md bg-danger/5 border border-danger/20 rounded-lg animate-in fade-in duration-300">
                        <p className="text-xs text-danger font-medium leading-relaxed select-none cursor-default">
                            {isProviderInactive
                                ? "Phương thức thanh toán này hiện đang bảo trì. Vui lòng chọn phương thức thanh toán khác."
                                : "Ngân hàng đang bảo trì. Vui lòng chọn ngân hàng khác."}
                        </p>
                    </div>
                )}

                <TermsAgreement isAgreed={isAgreed} onChange={(val) => dispatch(setIsAgreed(val))} />

                <div className="flex gap-md mt-xs">
                    <Button
                        size="large"
                        className={`flex-1 flex items-center justify-center gap-md transition-all duration-300 border-2 ${canCreate 
                            ? 'btn-primary border-transparent hover:scale-[1.01] shadow-lg shadow-primary/20' 
                            : 'bg-surface-muted text-foreground-muted border-border cursor-not-allowed opacity-60'}`}
                        onClick={handleCreateQR}
                        disabled={!canCreate}
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
    //#endregion
}
