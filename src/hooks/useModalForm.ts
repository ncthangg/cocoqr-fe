import { useEffect, useMemo } from "react";
import { useForm, type UseFormProps, type FieldValues, type DefaultValues, type UseFormReturn } from "react-hook-form";

export interface UseModalFormProps<TFieldValues extends FieldValues> extends Omit<UseFormProps<TFieldValues>, "defaultValues"> {
    /** Trạng thái mở của Modal */
    isOpen: boolean;
    /** Dữ liệu khởi tạo mặc định (khi tạo mới) */
    defaultValues: DefaultValues<TFieldValues>;
    /** Dữ liệu cập nhật (fetched data - khi edit) */
    values?: any;
    /** Bắt buộc validate form kể cả khi tạo mới hay chỉ update */
    requireDirtyOnCreate?: boolean;
}

export function useModalForm<TFieldValues extends FieldValues>({
    isOpen,
    defaultValues,
    values,
    requireDirtyOnCreate = false,
    ...formProps
}: UseModalFormProps<TFieldValues>): UseFormReturn<TFieldValues> & {
    isSubmitDisabled: boolean;
    isEditMode: boolean;
} {
    const methods = useForm<TFieldValues>({
        mode: "onChange",
        defaultValues,
        values, // RHF will automatically re-sync when `values` changes
        ...formProps,
    });

    const { isDirty, isValid } = methods.formState;

    const isEditMode = values != null;

    // Auto-clean the form ONLY when essential states change
    useEffect(() => {
        if (isOpen && values) {
            methods.reset(values);
        }

        if (!isOpen) {
            methods.reset(defaultValues);
        }
    }, [isOpen, values]);

    // Validation standard:
    // If invalid, always disabled
    // If editing: disabled if not dirty
    // If creating: disabled if not dirty (optional, controlled by requireDirtyOnCreate)
    const isSubmitDisabled = useMemo(() => {
        if (!isValid) return true;

        if (isEditMode) {
            return !isDirty;
        }

        if (requireDirtyOnCreate && !isDirty) {
            return true;
        }

        return false;
    }, [isValid, isEditMode, isDirty, requireDirtyOnCreate]);

    return {
        ...methods,
        isSubmitDisabled,
        isEditMode,
    };
}
