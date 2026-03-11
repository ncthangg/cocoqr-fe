import { ApiConstant } from "../constants/api.constant";
import type { AccountRes, PagingVM } from "../models/entity.model";
import { axiosPrivate } from "../api/axios.instance";
import type { PostAccountReq, PutAccountReq } from "@/models/entity.request.model";
import type { AccountProvider } from "@/models/enum";

export const accountApi = {
    getAll: async (pageNumber: number, pageSize: number,
        userId: string | null,
        sortField: string | null, sortDirection: "asc" | "desc" | null,
        provider: AccountProvider | null,
        isActive: boolean | null,
        searchValue: string | null): Promise<PagingVM<AccountRes>> => {
        const response = await axiosPrivate.get(ApiConstant.ACCOUNT.GET_ALL,
            {
                params: {
                    pageNumber: pageNumber,
                    pageSize: pageSize,
                    userId: userId,
                    sortField: sortField,
                    sortDirection: sortDirection,
                    provider: provider,
                    isActive: isActive,
                    searchValue: searchValue,
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
    delete: async (id: string): Promise<string> => {
        const response = await axiosPrivate.delete(ApiConstant.ACCOUNT.DELETE(id));
        return response.data;
    },
};
