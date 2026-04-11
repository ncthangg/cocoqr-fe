import React from "react";
import { Landmark, User, CreditCard } from "lucide-react";
import { Controller } from "react-hook-form";
import type { ProviderRes } from "@/models/entity.model";
import StatusToggle from "@/components/UICustoms/Form/StatusToggle";

interface FormSectionProps {
    providers: ProviderRes[];
    isBankType: boolean;
    onProviderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    register: any;
    control: any;
}

const FormSection: React.FC<FormSectionProps> = ({
    providers,
    isBankType,
    onProviderChange,
    register,
    control
}) => (
    <div className="md:col-span-3 flex flex-col gap-lg">
        <div className="flex flex-col gap-sm">
            <label className="text-sm font-semibold text-foreground-secondary flex items-center gap-sm">
                <Landmark className="w-4 h-4 text-primary" />
                Loại tài khoản
            </label>
            <select
                className="input focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer h-11"
                {...register("providerId", { required: true })}
                onChange={(e) => {
                    register("providerId").onChange(e);
                    onProviderChange(e);
                }}
            >
                <option value="" disabled hidden>Chọn loại tài khoản...</option>
                {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                ))}
            </select>
        </div>

        <div className="flex flex-col gap-sm">
            <label className="text-sm font-semibold text-foreground-secondary flex items-center gap-sm">
                <User className="w-4 h-4 text-primary" />
                Tên tài khoản
            </label>
            <input
                type="text"
                className="input uppercase tracking-wider h-11 focus:ring-2 focus:ring-primary/20 transition-all"
                {...register("accountHolder", { required: true, validate: (val: string) => !!(val && val.trim()) })}
                placeholder="NGUYEN VAN A"
            />
        </div>

        <div className="flex flex-col gap-sm">
            <label className="text-sm font-semibold text-foreground-secondary flex items-center gap-sm">
                <CreditCard className="w-4 h-4 text-primary" />
                {isBankType ? "Số tài khoản" : "Số điện thoại / ID ví"}
            </label>
            <input
                type="text"
                className="input h-11 focus:ring-2 focus:ring-primary/20 transition-all font-primary tracking-tight"
                {...register("accountNumber", { required: true, validate: (val: string) => !!(val && val.trim()) })}
                placeholder={isBankType ? "0123456789" : "09xxxxxxxx"}
            />
        </div>

        <Controller
            name="isActive"
            control={control}
            render={({ field: { onChange, value } }) => (
                <StatusToggle
                    checked={!!value}
                    onChange={(e) => onChange(e.target.checked)}
                    id="isActive-toggle"
                    checkedLabel="Đang hoạt động (Cho phép tạo QR)"
                    uncheckedLabel="Không hoạt động"
                />
            )}
        />
    </div>
);

export default FormSection;
