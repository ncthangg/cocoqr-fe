
import EnvConfig from "../config/env.config";
import type { RoleRes, SignInGoogleRes, TokenRes, UserRes } from "../models/entity.model";
import type { ApiSuccessResponse } from "../models/system.model";

const DEFAULT_LOCAL_BACKEND_URL = "https://localhost:7234/api";
export const GOOGLE_AUTH_TIMEOUT_MS = 2 * 60 * 1000;
const POPUP_WIDTH = 600;
const POPUP_HEIGHT = 700;
const POPUP_FEATURES = `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},menubar=no,toolbar=no,status=no,scrollbars=yes,resizable=yes`;

export const getBackendOrigin = () =>
  (EnvConfig.API_BASE_URL ?? DEFAULT_LOCAL_BACKEND_URL).replace(/\/$/, "");

export const buildGoogleAuthUrl = (path: string, frontendOrigin: string) =>
  `${getBackendOrigin()}${path}?origin=${encodeURIComponent(frontendOrigin)}`;

export const openGooglePopup = (authUrl: string) => {
  console.log("[GoogleAuth] Đang mở popup với URL:", authUrl);
  console.log("[GoogleAuth] Popup features:", POPUP_FEATURES);

  const popup = window.open(authUrl, "GoogleAuth", POPUP_FEATURES);

  if (!popup) {
    console.error("[GoogleAuth] Popup bị chặn bởi trình duyệt.");
  } else {
    console.info("[GoogleAuth] Popup đã được mở thành công.");

    // Thêm listener để theo dõi khi popup load
    popup.addEventListener('load', () => {
      console.log("[GoogleAuth] Popup đã load xong");
    });

    // Thêm listener để theo dõi khi popup bị lỗi
    popup.addEventListener('error', (error) => {
      console.error("[GoogleAuth] Popup gặp lỗi:", error);
    });
  }

  return popup;
};

export const registerGoogleAuthListener = (
  expectedOrigin: string,
  handler: (event: MessageEvent<ApiSuccessResponse<SignInGoogleRes>>) => void
) => {
  // Một số cấu hình API_BASE_URL có thể kèm /api, trong khi event.origin chỉ là scheme+host+port
  const expectedHostOrigin = (() => {
    try {
      return new URL(expectedOrigin).origin;
    } catch {
      return expectedOrigin;
    }
  })();

  const wrappedHandler = (event: MessageEvent) => {
    console.log("[GoogleAuth] Nhận được message từ origin:", event.origin);
    console.log("[GoogleAuth] Message data:", event.data);
    console.log("[GoogleAuth] Expected origins:", expectedOrigin, "or", expectedHostOrigin);

    const isAllowedOrigin =
      event.origin === expectedOrigin ||
      event.origin === expectedHostOrigin ||
      event.origin === window.location.origin; // Cho phép test message từ cùng origin

    if (!isAllowedOrigin) {
      console.warn("[GoogleAuth] Bỏ qua message từ origin không hợp lệ:", event.origin);
      return;
    }

    console.log("[GoogleAuth] Message từ origin hợp lệ, đang xử lý...");
    handler(event as MessageEvent<ApiSuccessResponse<SignInGoogleRes>>);
  };

  window.addEventListener("message", wrappedHandler);

  return () => {
    window.removeEventListener("message", wrappedHandler);
  };
};

type RawGoogleAuthResponse = {
  data?: {
    userRes: any;
    tokenRes: any;
    roleRes: any;
  };
  code?: string;
  message?: string | null;
  additionalData?: string | null;
};

//#region Helper functions
const transformRoleRes = (roles: any[]): RoleRes[] => {
  if (!roles || !Array.isArray(roles)) return [];

  return roles.map(role => ({
    id: role.id ?? role.Id,
    name: role.name ?? role.Name,
    nameUpperCase: role.nameUpperCase ?? role.NameUpperCase
  }));
};

// Helper function to transform PascalCase UserRes to camelCase
const transformUserRes = (pascalUser: any): UserRes => {
  if (!pascalUser) return {} as UserRes;
  return {
    userId: pascalUser.userId || pascalUser.UserId,
    googleId: pascalUser.googleId || pascalUser.GoogleId,
    email: pascalUser.email || pascalUser.Email,
    fullName: pascalUser.fullName || pascalUser.FullName,
    pictureUrl: pascalUser.pictureUrl || pascalUser.avatarUrl || pascalUser.PictureUrl,
  };
};

const transformTokenRes = (pascalToken: any): TokenRes => {
  if (!pascalToken) return {} as TokenRes;
  return {
    accessToken: pascalToken.accessToken || pascalToken.AccessToken,
    refreshToken: pascalToken.refreshToken || pascalToken.RefreshToken
  };
};

//#endregion

const normalizeGoogleAuthResponse = (
  raw: RawGoogleAuthResponse
): ApiSuccessResponse<SignInGoogleRes> | null => {
  const rawData = raw.data;

  console.log("[GoogleAuth] Raw data:", raw);
  console.log("[GoogleAuth] Raw data data:", rawData);

  if (raw.code !== "SUCCESS") {
    console.error("[GoogleAuth] API trả về lỗi:", raw);
    return null;
  }

  if (!rawData?.tokenRes || !rawData?.userRes) {
    console.error("[GoogleAuth] Thiếu token hoặc user:", rawData);
    return null;
  }

  const normalized: ApiSuccessResponse<SignInGoogleRes> = {
    code: raw.code ?? "",
    message: raw.message ?? null,
    additionalData: raw.additionalData ?? null,
    data: {
      token: transformTokenRes(rawData.tokenRes),
      user: transformUserRes(rawData.userRes),
      roles: transformRoleRes(rawData.roleRes),
    },
  };

  if (!normalized.message && raw.additionalData) {
    normalized.message = raw.additionalData;
  }

  return normalized;
};

export const parseGoogleAuthPayload = (
  payload: unknown
): ApiSuccessResponse<SignInGoogleRes> | null => {
  try {
    let data: unknown = payload;

    if (typeof data === "string") {
      const firstLayer = JSON.parse(data);
      data = typeof firstLayer === "string" ? JSON.parse(firstLayer) : firstLayer;
    }

    if (!data || typeof data !== "object") {
      console.error("[GoogleAuth] Payload không phải object:", data);
      return null;
    }

    return normalizeGoogleAuthResponse(data as RawGoogleAuthResponse);
  } catch (error) {
    console.error("[GoogleAuth] Lỗi parse payload:", error);
    return null;
  }
};