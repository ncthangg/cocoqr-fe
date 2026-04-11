import { ApiConstant } from "../constants/api.constant";
import type { PagingVM, GetUserBaseRes } from "../models/entity.model";
import { axiosPrivate } from "../api/axios.instance";
import type { GetUsersReq } from "../models/entity.request.model";

export const userApi = {
    getAll: async (params: GetUsersReq): Promise<PagingVM<GetUserBaseRes>> => {
        const response = await axiosPrivate.get(ApiConstant.USER.GET_ALL, {
            params: {
                pageNumber: params.pageNumber,
                pageSize: params.pageSize,
                sortField: params.sortField,
                sortDirection: params.sortDirection,
                status: params.status,
                searchValue: params.searchValue,
                roleId: params.roleId,
            },
        });
        return response.data;
    },
    patchStatus: async (id: string): Promise<string> => {
        const response = await axiosPrivate.patch(ApiConstant.USER.PATCH_STATUS(id));
        return response.data;
    },
};
