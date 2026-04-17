import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ProviderRes } from "@/models/entity.model";

interface HeroFormState {
    formData: {
        providerId: string;
        providerCode: string;
        providerName: string;
        isProviderInactive: boolean | null;
        napasBin: string;
        bankCode: string;
        bankName: string;
        bankShortName: string;
        bankLogoUrl: string | null;
        isBankInactive: boolean | null;
        number: string;
        amount: string;
        note: string;
    };
    allProviders: ProviderRes[];
    hasFetchedProviders: boolean;
    isAgreed: boolean;
    isProviderMaintenance: boolean;
    isBankMaintenance: boolean;
}

const initialState: HeroFormState = {
    formData: {
        providerId: "",
        providerCode: "",
        providerName: "",
        isProviderInactive: null,
        napasBin: "",
        bankCode: "",
        bankName: "",
        bankShortName: "",
        bankLogoUrl: "",
        isBankInactive: null,
        number: "",
        amount: "",
        note: "",
    },
    allProviders: [],
    hasFetchedProviders: false,
    isAgreed: false,
    isProviderMaintenance: false,
    isBankMaintenance: false,
};

const heroFormSlice = createSlice({
    name: "heroForm",
    initialState,
    reducers: {
        setFormData: (state, action: PayloadAction<Partial<HeroFormState["formData"]>>) => {
            state.formData = { ...state.formData, ...action.payload };
        },
        setAllProviders: (state, action: PayloadAction<ProviderRes[]>) => {
            state.allProviders = action.payload;
            state.hasFetchedProviders = true;
        },
        setHasFetchedProviders: (state, action: PayloadAction<boolean>) => {
            state.hasFetchedProviders = action.payload;
        },
        setIsAgreed: (state, action: PayloadAction<boolean>) => {
            state.isAgreed = action.payload;
        },
        setIsProviderMaintenance: (state, action: PayloadAction<boolean>) => {
            state.isProviderMaintenance = action.payload;
        },
        setIsBankMaintenance: (state, action: PayloadAction<boolean>) => {
            state.isBankMaintenance = action.payload;
        },
        resetHeroForm: () => initialState,
    },
});

export const {
    setFormData,
    setAllProviders,
    setHasFetchedProviders,
    setIsAgreed,
    setIsProviderMaintenance,
    setIsBankMaintenance,
    resetHeroForm,
} = heroFormSlice.actions;

export default heroFormSlice.reducer;
