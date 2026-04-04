import { ApiConstant } from "../constants/api.constant";
import type { PagingVM, BankRes } from "../models/entity.model";
import { axiosPrivate, axiosPublic } from "../api/axios.instance";
import type { PutBankInfoReq, GetBanksReq } from "../models/entity.request.model";

export const bankApi = {
    getAll: async (params: GetBanksReq): Promise<PagingVM<BankRes>> => {
        const response = await axiosPublic.get(ApiConstant.BANKINFO.GET_ALL,
            {
                params: {
                    pageNumber: params.pageNumber,
                    pageSize: params.pageSize,
                    sortField: params.sortField,
                    sortDirection: params.sortDirection,
                    isActive: params.isActive,
                    searchValue: params.searchValue,
                    status: params.status,
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
