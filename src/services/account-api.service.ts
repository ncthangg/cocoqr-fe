import { ApiConstant } from "../constants/api.constant";
import type { AccountRes, PagingVM } from "../models/entity.model";
import { axiosPrivate } from "../api/axios.instance";
import type { PostAccountReq, PutAccountReq, GetAccountsReq } from "@/models/entity.request.model";


export const accountApi = {
    getAll: async (params: GetAccountsReq): Promise<PagingVM<AccountRes>> => {
        const response = await axiosPrivate.get(ApiConstant.ACCOUNT.GET_ALL,
            {
                params: {
                    pageNumber: params.pageNumber,
                    pageSize: params.pageSize,
                    sortField: params.sortField,
                    sortDirection: params.sortDirection,
                    providerId: params.providerId,
                    searchValue: params.searchValue,
                    isActive: params.isActive,
                }
            }
        );
        return response.data;
    },
    getAllByAdmin: async (params: GetAccountsReq): Promise<PagingVM<AccountRes>> => {
        const response = await axiosPrivate.get(ApiConstant.ACCOUNT.GET_ALL_BY_ADMIN,
            {
                params: {
                    pageNumber: params.pageNumber,
                    pageSize: params.pageSize,
                    sortField: params.sortField,
                    sortDirection: params.sortDirection,
                    userId: params.userId,
                    providerId: params.providerId,
                    searchValue: params.searchValue,
                    isActive: params.isActive,
                    isDeleted: params.isDeleted,
                    status: params.status,
                }
            }
        );
        return response.data;
    },
    getById: async (id: string): Promise<AccountRes> => {
        const response = await axiosPrivate.get(ApiConstant.ACCOUNT.GET_BY_ID(id));
        return response.data;
    },
    post: async (req: PostAccountReq): Promise<string> => {
        const response = await axiosPrivate.post(ApiConstant.ACCOUNT.POST, req);
        return response.data;
    },
    put: async (id: string, req: PutAccountReq): Promise<string> => {
        const response = await axiosPrivate.put(ApiConstant.ACCOUNT.PUT(id), req);
        return response.data;
    },
    patchIsPinned: async (id: string, isPinned: boolean): Promise<string> => {
        const response = await axiosPrivate.patch(ApiConstant.ACCOUNT.PATCH_PIN(id), null, {
            params: { isPinned }
        });
        return response.data;
    },
    patchStatus: async (id: string): Promise<string> => {
        const response = await axiosPrivate.patch(ApiConstant.ACCOUNT.PATCH_STATUS(id));
        return response.data;
    },
    delete: async (id: string): Promise<string> => {
        const response = await axiosPrivate.delete(ApiConstant.ACCOUNT.DELETE(id));
        return response.data;
    },
};
