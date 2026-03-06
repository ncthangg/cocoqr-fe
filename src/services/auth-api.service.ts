import { ApiConstant } from "../constants/api.constant";
import type { SignInGoogleRes, UserRes } from "../models/entity.model";
import { axiosPrivate, axiosPublic } from "../api/axios.instance";

export const authApi = {
    signInWithGoogle: async (idToken: string): Promise<SignInGoogleRes> => {
        const response = await axiosPublic.post(ApiConstant.AUTH.SIGN_IN, {
            idToken,
        });
        return response.data;
    },
    me: async (): Promise<UserRes> => {
        const response = await axiosPrivate.get(ApiConstant.AUTH.ME);
        return response.data;
    },
    signOut: async (): Promise<UserRes> => {
        const response = await axiosPrivate.post(ApiConstant.AUTH.SIGN_OUT);
        return response.data;
    },
};
