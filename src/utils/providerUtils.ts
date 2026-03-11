import { AccountProvider } from "@/models/enum";

export const getProviderLabel = (value: AccountProvider): string => {
    switch (value) {
        case AccountProvider.BANK: return "Ngân hàng";
        case AccountProvider.MOMO: return "Ví MoMo";
        case AccountProvider.VNPAY: return "Ví VNPay";
        case AccountProvider.ZALOPAY: return "Ví ZaloPay";
        default: return "Không xác định";
    }
};