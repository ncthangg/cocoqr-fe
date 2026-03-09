import { ApiConstant } from "../constants/api.constant";
import type { AccountRes, PagingVM } from "../models/entity.model";
import { axiosPrivate, axiosPublic } from "../api/axios.instance";
import type { PostAccountReq, PutAccountReq } from "@/models/entity.request.model";

export const accountApi = {
    getAll: async (pageNumber: number, pageSize: number, sortField: string | null, sortDirection: "asc" | "desc" | null, isActive: boolean | null, searchValue: string | null): Promise<PagingVM<AccountRes>> => {
        const response = await axiosPublic.get(ApiConstant.BANKINFO.GET_ALL,
            {
                params: {
                    pageNumber: pageNumber,
                    pageSize: pageSize,
                    sortField: sortField,
                    sortDirection: sortDirection,
                    isActive: isActive,
                    searchValue: searchValue,
                }
            }
        );
        return response.data;
    },
    getById: async (id: string): Promise<AccountRes> => {
        const response = await axiosPrivate.get(ApiConstant.BANKINFO.GET_BY_ID(id));
        return response.data;
    },
    post: async (req: PostAccountReq): Promise<string> => {
        const response = await axiosPrivate.post(ApiConstant.BANKINFO.POST, req);
        return response.data;
    },
    put: async (id: string, req: PutAccountReq): Promise<string> => {
        const response = await axiosPrivate.put(ApiConstant.BANKINFO.PUT(id), req);
        return response.data;
    },
    delete: async (id: string): Promise<string> => {
        const response = await axiosPrivate.delete(ApiConstant.BANKINFO.DELETE(id));
        return response.data;
    },
};
