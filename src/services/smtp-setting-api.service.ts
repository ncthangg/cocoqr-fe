import { axiosPrivate } from "../api/axios.instance";
import { ApiConstant } from "../constants/api.constant";
import type { SmtpSettingRes } from "../models/entity.model";
import type { GetSmtpSettingReq, PutSmtpSettingReq, TestSmtpSettingReq } from "../models/entity.request.model";

export const smtpSettingApi = {
    // type = null → returns all settings as an array
    get: async (params?: GetSmtpSettingReq): Promise<any> => {
        const response = await axiosPrivate.get(ApiConstant.SMTP_SETTING.GET, {
            params: params,
        });
        return response.data;
    },
    put: async (data: PutSmtpSettingReq): Promise<SmtpSettingRes> => {
        const response = await axiosPrivate.put(ApiConstant.SMTP_SETTING.PUT, data);
        return response.data;
    },
    test: async (data: TestSmtpSettingReq): Promise<any> => {
        const response = await axiosPrivate.post(ApiConstant.SMTP_SETTING.TEST, data);
        return response.data;
    },
    delete: async (id: string): Promise<any> => {
        const response = await axiosPrivate.delete(ApiConstant.SMTP_SETTING.DELETE(id));
        return response.data;
    },
};
