import { ApiConstant } from "../constants/api.constant";
import type { UserRes } from "../models/entity.model";
import { axiosPrivate } from "../api/axios.instance";

export const accountApi = {
    me: async (): Promise<UserRes> => {
        const response = await axiosPrivate.get(ApiConstant.AUTH.ME);
        return response.data;
    },
    signOut: async (): Promise<string> => {
        const response = await axiosPrivate.post(ApiConstant.AUTH.SIGN_OUT);
        return response.data;
    },
};
