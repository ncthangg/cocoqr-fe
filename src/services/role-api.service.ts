import { ApiConstant } from "../constants/api.constant";
import type { RoleRes } from "../models/entity.model";
import { axiosPrivate, axiosPublic } from "../api/axios.instance";
import type { PostRoleReq, PutRoleReq } from "../models/entity.request.model";

export const roleApi = {
    getAll: async (): Promise<RoleRes[]> => {
        const response = await axiosPublic.get(ApiConstant.ROLE.GET_ALL);
        return response.data;
    },
    post: async (req: PostRoleReq): Promise<string> => {
        const response = await axiosPrivate.post(ApiConstant.ROLE.POST, req);
        return response.data;
    },
    put: async (id: string, req: PutRoleReq): Promise<string> => {
        const response = await axiosPrivate.put(ApiConstant.ROLE.PUT(id), req);
        return response.data;
    },
    delete: async (id: string): Promise<string> => {
        const response = await axiosPrivate.delete(ApiConstant.ROLE.DELETE(id));
        return response.data;
    },
};
