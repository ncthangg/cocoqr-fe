
import { ApiConstant } from "../constants/api.constant";
import type { PagingVM, GetUserBaseRes } from "../models/entity.model";
import { axiosPrivate } from "../api/axios.instance";

export const userApi = {
    getAll: async (pageNumber: number, pageSize: number,
        sortField: string | null,
        sortDirection: "asc" | "desc" | null,
        status: boolean | null,
        searchValue: string | null,
        roleId: string | null): Promise<PagingVM<GetUserBaseRes>> => {
        const response = await axiosPrivate.get(ApiConstant.USER.GET_ALL, {
            params: {
                pageNumber,
                pageSize,
                sortField,
                sortDirection,
                status,
                searchValue,
                roleId,
            },
        });
        return response.data;
    },
    updateStatus: async (id: string, status: boolean): Promise<string> => {
        const response = await axiosPrivate.put(ApiConstant.USER.PUT_STATUS(id), { status });
        return response.data;
    },
};
