import { ApiConstant } from "../constants/api.constant";
import { axiosPrivate } from "../api/axios.instance";
import type { PostQrReq, GetQrReq } from "@/models/entity.request.model";
import type { PostQrRes, QrRes, PagingVM } from "@/models/entity.model";

export const qrApi = {
    post: async (req: PostQrReq): Promise<PostQrRes> => {
        const response = await axiosPrivate.post(ApiConstant.QR.POST, req);
        return response.data;
    },

    getAll: async (params: GetQrReq): Promise<PagingVM<QrRes>> => {
        const response = await axiosPrivate.get(ApiConstant.QR.GET_ALL, {
            params: {
                pageNumber: params.pageNumber,
                pageSize: params.pageSize,
                sortField: params.sortField,
                sortDirection: params.sortDirection,
                providerId: params.providerId,
                searchValue: params.searchValue,
            }
        });
        return response.data;
    },

    getAllByAdmin: async (params: GetQrReq): Promise<PagingVM<QrRes>> => {
        const response = await axiosPrivate.get(ApiConstant.QR.GET_ALL_BY_ADMIN, {
            params: {
                pageNumber: params.pageNumber,
                pageSize: params.pageSize,
                sortField: params.sortField,
                sortDirection: params.sortDirection,
                userId: params.userId,
                providerId: params.providerId,
                searchValue: params.searchValue,
            }
        });
        return response.data;
    },

    getById: async (id: number): Promise<QrRes> => {
        const response = await axiosPrivate.get(ApiConstant.QR.GET_BY_ID(id.toString()));
        return response.data;
    },
};
