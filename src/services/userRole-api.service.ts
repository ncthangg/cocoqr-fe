import { ApiConstant } from "../constants/api.constant";
import type { GetUserBaseRes } from "../models/entity.model";
import { axiosPrivate } from "../api/axios.instance";
import type { PostPutUserRoleReq } from "../models/entity.request.model";

export const userRoleApi = {
    getByUserId: async (userId: string): Promise<GetUserBaseRes[]> => {
        const response = await axiosPrivate.get(ApiConstant.USER_ROLE.GET_ROLES_BY_USER_ID(userId));
        return response.data;
    },
    postPut: async (req: PostPutUserRoleReq): Promise<string> => {
        const response = await axiosPrivate.post(ApiConstant.USER_ROLE.ADD_USER_TO_ROLE, req);
        return response.data;
    },
};
