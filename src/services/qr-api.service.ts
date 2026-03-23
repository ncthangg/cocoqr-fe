import { ApiConstant } from "../constants/api.constant";
import { axiosPrivate } from "../api/axios.instance";
import type { PostQrReq } from "@/models/entity.request.model";
import type { PostQrRes, QrRes, PagingVM } from "@/models/entity.model";

export const qrApi = {
    post: async (req: PostQrReq): Promise<PostQrRes> => {
        const response = await axiosPrivate.post(ApiConstant.QR.POST, req);
        return response.data;
    },

    getAll: async (
        pageNumber: number, pageSize: number,
        sortField: string | null, sortDirection: "asc" | "desc" | null,
        providerId: string | null,
        searchValue: string | null,
    ): Promise<PagingVM<QrRes>> => {
        const response = await axiosPrivate.get(ApiConstant.QR.GET_ALL, {
            params: {
                pageNumber,
                pageSize,
                sortField,
                sortDirection,
                providerId,
                searchValue,
            }
        });
        return response.data;
    },

    getAllByAdmin: async (
        pageNumber: number, pageSize: number,
        sortField: string | null, sortDirection: "asc" | "desc" | null,
        userId: string | null,
        providerId: string | null,
        searchValue: string | null,
    ): Promise<PagingVM<QrRes>> => {
        const response = await axiosPrivate.get(ApiConstant.QR.GET_ALL_BY_ADMIN, {
            params: {
                pageNumber,
                pageSize,
                sortField,
                sortDirection,
                userId,
                providerId,
                searchValue,
            }
        });
        return response.data;
    },

    getById: async (id: number): Promise<QrRes> => {
        const response = await axiosPrivate.get(ApiConstant.QR.GET_BY_ID(id.toString()));
        return response.data;
    },
};
