import { ApiConstant } from "../constants/api.constant";
import { axiosPrivate } from "../api/axios.instance";
import type { SyncPreviewRes } from "../models/entity.model";

export const dataSyncApi = {
    // Banks
    syncBanks: async (): Promise<string> => {
        const response = await axiosPrivate.post(ApiConstant.DATASYNC.BANKS);
        return response.data;
    },
    previewBanks: async (): Promise<SyncPreviewRes> => {
        const response = await axiosPrivate.post(ApiConstant.DATASYNC.BANKS_PREVIEW);
        return response.data;
    },

    // Roles
    syncRoles: async (): Promise<string> => {
        const response = await axiosPrivate.post(ApiConstant.DATASYNC.ROLES);
        return response.data;
    },
    previewRoles: async (): Promise<SyncPreviewRes> => {
        const response = await axiosPrivate.post(ApiConstant.DATASYNC.ROLES_PREVIEW);
        return response.data;
    },

    // Providers
    syncProviders: async (): Promise<string> => {
        const response = await axiosPrivate.post(ApiConstant.DATASYNC.PROVIDERS);
        return response.data;
    },
    previewProviders: async (): Promise<SyncPreviewRes> => {
        const response = await axiosPrivate.post(ApiConstant.DATASYNC.PROVIDERS_PREVIEW);
        return response.data;
    },
};
