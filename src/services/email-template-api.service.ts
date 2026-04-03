import { axiosPrivate } from "../api/axios.instance";
import { ApiConstant } from "../constants/api.constant";
import type { EmailTemplateRes } from "../models/entity.model";
import type { PostEmailTemplateReq, PutEmailTemplateReq } from "../models/entity.request.model";

export const emailTemplateApi = {
    getAll: async (): Promise<EmailTemplateRes[]> => {
        const response = await axiosPrivate.get(ApiConstant.EMAIL_TEMPLATE.GET_ALL);
        return response.data;
    },
    getById: async (id: string): Promise<EmailTemplateRes> => {
        const response = await axiosPrivate.get(ApiConstant.EMAIL_TEMPLATE.GET_BY_ID(id));
        return response.data;
    },
    create: async (data: PostEmailTemplateReq): Promise<EmailTemplateRes> => {
        const response = await axiosPrivate.post(ApiConstant.EMAIL_TEMPLATE.POST, data);
        return response.data;
    },
    update: async (id: string, data: PutEmailTemplateReq): Promise<EmailTemplateRes> => {
        const response = await axiosPrivate.put(ApiConstant.EMAIL_TEMPLATE.PUT(id), data);
        return response.data;
    },
    delete: async (id: string): Promise<any> => {
        const response = await axiosPrivate.delete(ApiConstant.EMAIL_TEMPLATE.DELETE(id));
        return response.data;
    },
};
