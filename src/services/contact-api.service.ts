import { axiosPrivate } from "../api/axios.instance";
import { ApiConstant } from "../constants/api.constant";
import type { PostContactReq } from "../models/entity.request.model";

export const contactApi = {
    post: async (data: PostContactReq): Promise<any> => {
        const response = await axiosPrivate.post(ApiConstant.CONTACT.POST, data);
        return response.data;
    },
};
