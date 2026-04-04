import { axiosPrivate } from "../api/axios.instance";
import { ApiConstant } from "../constants/api.constant";
import type { AdminPostContactReq, GetContactMessageReq } from "../models/entity.request.model";
import type { ContactMessageRes, PagingVM } from "../models/entity.model";

export const adminContactApi = {
    getAll: async (params: GetContactMessageReq): Promise<PagingVM<ContactMessageRes>> => {
        const response = await axiosPrivate.get(ApiConstant.ADMIN_CONTACT.GET_ALL, {
            params: {
                pageNumber: params.pageNumber,
                pageSize: params.pageSize,
                sortField: params.sortField,
                sortDirection: params.sortDirection,
                fullName: params.fullName,
                email: params.email,
                contactStatus: params.contactStatus,
                fromDate: params.fromDate,
                toDate: params.toDate,
            },
        });
        return response.data;
    },
    getById: async (id: string): Promise<ContactMessageRes> => {
        const response = await axiosPrivate.get(ApiConstant.ADMIN_CONTACT.GET_BY_ID(id));
        return response.data;
    },
    post: async (data: AdminPostContactReq): Promise<any> => {
        const response = await axiosPrivate.post(ApiConstant.ADMIN_CONTACT.POST, data);
        return response.data;
    },
    patchIgnore: async (id: string): Promise<any> => {
        const response = await axiosPrivate.patch(ApiConstant.ADMIN_CONTACT.PATCH_IGNORE(id));
        return response.data;
    },
};
