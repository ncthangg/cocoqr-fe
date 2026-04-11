import { ApiConstant } from "../constants/api.constant";
import { axiosPrivate, axiosPublic } from "../api/axios.instance";
import type { PutRoleReq } from "../models/entity.request.model";
import type { RoleRes } from "@/models/entity.model";

export const roleApi = {
    getAll: async (): Promise<RoleRes[]> => {
        const response = await axiosPublic.get(ApiConstant.ROLE.GET_ALL);
        return response.data;
    },
    put: async (id: string, req: PutRoleReq): Promise<string> => {
        const response = await axiosPrivate.put(ApiConstant.ROLE.PUT(id), req);
        return response.data;
    },
};
