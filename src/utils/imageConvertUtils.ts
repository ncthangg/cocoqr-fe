import EnvConfig from "../config/env.config";


export function resolveAvatarPreview(avatarPath: string | null): string {
    if (!avatarPath || avatarPath === "") return "";
    return `${EnvConfig.BASE_URL}/${avatarPath}`;
}