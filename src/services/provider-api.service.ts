import { ApiConstant } from "../constants/api.constant";
import type { ProviderRes } from "../models/entity.model";
import { axiosPrivate } from "../api/axios.instance";
import type { PostProviderReq, PutProviderReq } from "../models/entity.request.model";

export const providerApi = {
    getAll: async (): Promise<ProviderRes[]> => {
        const response = await axiosPrivate.get(ApiConstant.PROVIDER.GET_ALL);
        return response.data;
    },
    post: async (req: PostProviderReq | FormData): Promise<string> => {
        const response = await axiosPrivate.post(ApiConstant.PROVIDER.POST, req, {
            headers: req instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined
        });
        return response.data;
    },
    put: async (id: string, req: PutProviderReq | FormData): Promise<string> => {
        const response = await axiosPrivate.put(ApiConstant.PROVIDER.PUT(id), req, {
            headers: req instanceof FormData ? { "Content-Type": "multipart/form-data" } : undefined
        });
        return response.data;
    },
    delete: async (id: string): Promise<string> => {
        const response = await axiosPrivate.delete(ApiConstant.PROVIDER.DELETE(id));
        return response.data;
    },
};
