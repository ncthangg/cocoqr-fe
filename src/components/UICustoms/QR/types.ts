import { type DotType, type CornerSquareType } from "qr-code-styling";

import { QRType } from "@/models/enum";

export interface QRDisplayProps {
    type: QRType;
    qrImageUrl?: string | null;
    qrData?: string | null;
    styleJson?: string | null;
    transactionRef?: string;
    onDownload?: () => void;
    onCopyLink?: () => void;
    isWide?: boolean;
    shouldFetchStyles?: boolean;
    className?: string;
}

export interface StyleConfig {
    bgColor: string;
    pointColor: string;
    eyeColor: string;
    borderColor: string;
    pattern: string;
    fileSize: number;
    logo: string | null;
}

export const DEFAULT_STYLE: StyleConfig = {
    bgColor: "#ffffff",
    pointColor: "#000000",
    eyeColor: "#000000",
    borderColor: "#ffffff",
    pattern: "default",
    fileSize: 512,
    logo: null
};

export type AnimationState = 'closed' | 'opening' | 'open' | 'closing';

//#region Helpers
export function parseStyleJson(json: string): StyleConfig {
    try {
        const parsed = JSON.parse(json);
        return { ...DEFAULT_STYLE, ...parsed };
    } catch {
        return { ...DEFAULT_STYLE };
    }
}

export const patternToDotType = (p: string): DotType => {
    if (p === "dots") return "dots";
    if (p === "rounded") return "rounded";
    return "square";
};

export const patternToEyeType = (p: string): CornerSquareType => {
    if (p === "dots") return "dot";
    if (p === "rounded") return "extra-rounded";
    return "square";
};
//#endregion
