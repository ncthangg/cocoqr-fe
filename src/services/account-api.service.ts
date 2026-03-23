import { ApiConstant } from "../constants/api.constant";
import type { AccountRes, PagingVM } from "../models/entity.model";
import { axiosPrivate } from "../api/axios.instance";
import type { PostAccountReq, PutAccountReq } from "@/models/entity.request.model";


export const accountApi = {
    getAll: async (pageNumber: number, pageSize: number,
        sortField: string | null, sortDirection: "asc" | "desc" | null,
        providerId: string | null,
        searchValue: string | null,
        isActive: boolean | null
    ): Promise<PagingVM<AccountRes>> => {
        const response = await axiosPrivate.get(ApiConstant.ACCOUNT.GET_ALL,
            {
                params: {
                    pageNumber: pageNumber,
                    pageSize: pageSize,
                    sortField: sortField,
                    sortDirection: sortDirection,
                    providerId: providerId,
                    searchValue: searchValue,
                    isActive: isActive,
                }
            }
        );
        return response.data;
    },
    getAllByAdmin: async (pageNumber: number, pageSize: number,
        sortField: string | null, sortDirection: "asc" | "desc" | null,
        userId: string | null,
        providerId: string | null,
        searchValue: string | null,
        isActive: boolean | null,
        isDeleted: boolean | null,
        status: boolean | null
    ): Promise<PagingVM<AccountRes>> => {
        const response = await axiosPrivate.get(ApiConstant.ACCOUNT.GET_ALL_BY_ADMIN,
            {
                params: {
                    pageNumber: pageNumber,
                    pageSize: pageSize,
                    sortField: sortField,
                    sortDirection: sortDirection,
                    userId: userId,
                    providerId: providerId,
                    searchValue: searchValue,
                    isActive: isActive,
                    isDeleted: isDeleted,
                    status: status,
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
    updateStatus: async (id: string, status: boolean): Promise<string> => {
        const response = await axiosPrivate.put(ApiConstant.ACCOUNT.PUT_STATUS(id), { status });
        return response.data;
    },
    delete: async (id: string): Promise<string> => {
        const response = await axiosPrivate.delete(ApiConstant.ACCOUNT.DELETE(id));
        return response.data;
    },
};
