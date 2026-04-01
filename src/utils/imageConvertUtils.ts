import EnvConfig from "../config/env.config";

/**
 * Resolves an image/resource URL from the static server or absolute URL.
 * Refactored to robustly handle full paths returned by Backend (BE) DigitalOcean Spaces.
 * 
 * @param path The resource path or absolute URL
 * @returns string Fully qualified URL
 */
export function resolveResourceUrl(path: string | null | undefined): string {
    if (!path || path === "") return "";
    
    // 1. Handle absolute URLs (DigitalOcean, external links, local blobs, base64)
    // Check if path is already absolute URL, a local blob, or starts with double slash
    if (
        path.startsWith("http://") || 
        path.startsWith("https://") || 
        path.startsWith("blob:") ||
        path.startsWith("data:") ||
        path.startsWith("//")
    ) {
        return path;
    }

    // 2. Handle relative paths (Legacy support or Backend-served static assets)
    // Ensure no leading slash to avoid double slashes with BASE_URL
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${EnvConfig.BASE_URL}/${cleanPath}`;
}

/**
 * Backward compatibility alias for resolveResourceUrl.
 * Primarily used for user avatars and brand logos.
 */
export function resolveAvatarPreview(avatarPath: string | null | undefined): string {
    return resolveResourceUrl(avatarPath);
}