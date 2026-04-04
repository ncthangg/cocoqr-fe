import { ApiConstant } from "../constants/api.constant";
import { axiosPrivate } from "../api/axios.instance";
import type { GetEmailLogReq } from "../models/entity.request.model";
import type { GetEmailLogByIdRes, GetEmailLogRes, PagingVM } from "../models/entity.model";

export const emailLogApi = {
    getAll: async (params: GetEmailLogReq): Promise<PagingVM<GetEmailLogRes>> => {
        const response = await axiosPrivate.get(ApiConstant.EMAIL_LOG.GET_ALL, { params });
        return response.data;
    },

    getById: async (id: string): Promise<GetEmailLogByIdRes> => {
        const response = await axiosPrivate.get(ApiConstant.EMAIL_LOG.GET_BY_ID(id));
        return response.data;
    },
};
