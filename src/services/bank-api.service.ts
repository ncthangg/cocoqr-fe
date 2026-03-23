import { ApiConstant } from "../constants/api.constant";
import type { PagingVM, BankRes } from "../models/entity.model";
import { axiosPrivate, axiosPublic } from "../api/axios.instance";
import type { PutBankInfoReq } from "../models/entity.request.model";

export const bankApi = {
    getAll: async (pageNumber: number, pageSize: number,
        sortField: string | null,
        sortDirection: "asc" | "desc" | null,
        isActive: boolean | null,
        searchValue: string | null): Promise<PagingVM<BankRes>> => {
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
    put: async (id: string, req: PutBankInfoReq | FormData): Promise<string> => {
        const response = await axiosPrivate.put(ApiConstant.BANKINFO.PUT(id), req, {
            headers: req instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined
        });
        return response.data;
    },
};
