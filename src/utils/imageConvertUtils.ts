import EnvConfig from "../config/env.config";

export function resolveAvatarPreview(avatarPath: string | null): string {
    if (!avatarPath || avatarPath === "") return "";
    
    // Check if path is already absolute URL or a local blob
    if (avatarPath.startsWith("http://") || 
        avatarPath.startsWith("https://") || 
        avatarPath.startsWith("blob:")) {
        return avatarPath;
    }

    return `${EnvConfig.BASE_URL}/${avatarPath}`;
}