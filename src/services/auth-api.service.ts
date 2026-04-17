import { ApiConstant } from "../constants/api.constant";
import type { SwitchRoleRes, UserRes } from "../models/entity.model";
import { axiosPrivate } from "../api/axios.instance";
import type { SwitchRoleReq } from "@/models/entity.request.model";

export const authApi = {
    me: async (): Promise<UserRes> => {
        const response = await axiosPrivate.get(ApiConstant.AUTH.ME);
        return response.data;
    },
    signOut: async (): Promise<UserRes> => {
        const response = await axiosPrivate.post(ApiConstant.AUTH.SIGN_OUT);
        return response.data;
    },
    switchRole: async (data: SwitchRoleReq): Promise<SwitchRoleRes> => {
        const response = await axiosPrivate.post(ApiConstant.AUTH.SWITCH_ROLE, data);
        return response.data;
    }
};
