import { ApiConstant } from "../constants/api.constant";
import { axiosPrivate } from "../api/axios.instance";
import type { PostQrReq } from "@/models/entity.request.model";
import type { PostQrRes } from "@/models/entity.model";

export const qrApi = {
    post: async (req: PostQrReq): Promise<PostQrRes> => {
        const response = await axiosPrivate.post(ApiConstant.QR.POST, req);
        return response.data;
    },
};
