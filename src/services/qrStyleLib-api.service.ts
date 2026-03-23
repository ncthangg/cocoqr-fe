import { ApiConstant } from "../constants/api.constant";
import { axiosPrivate } from "../api/axios.instance";
import type { QrStyleLibraryRes } from "../models/entity.model";
import type { GetQrStyleLibraryReq, CreateQrStyleLibraryReq, UpdateQrStyleLibraryReq } from "../models/entity.request.model";

export const qrStyleLibApi = {
    getAll: async (params?: GetQrStyleLibraryReq): Promise<QrStyleLibraryRes[]> => {
        const response = await axiosPrivate.get(ApiConstant.QR_STYLE_LIB.GET_ALL, { params });
        return response.data;
    },
    getById: async (id: string): Promise<QrStyleLibraryRes> => {
        const response = await axiosPrivate.get(ApiConstant.QR_STYLE_LIB.GET_BY_ID(id));
        return response.data;
    },
    post: async (req: CreateQrStyleLibraryReq): Promise<string> => {
        const response = await axiosPrivate.post(ApiConstant.QR_STYLE_LIB.POST, req);
        return response.data;
    },
    put: async (id: string, req: UpdateQrStyleLibraryReq): Promise<string> => {
        const response = await axiosPrivate.put(ApiConstant.QR_STYLE_LIB.PUT(id), req);
        return response.data;
    },
    delete: async (id: string): Promise<string> => {
        const response = await axiosPrivate.delete(ApiConstant.QR_STYLE_LIB.DELETE(id));
        return response.data;
    }
};
