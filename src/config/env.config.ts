let baseUrl;

switch (import.meta.env.MODE) {
    case "development":
        baseUrl = import.meta.env.VITE_DEV_API_URL;
        break;

    case "staging":
        baseUrl = import.meta.env.VITE_STAGING_API_URL;
        break;

    case "production":
        baseUrl = import.meta.env.VITE_PRODUCTION_API_URL;
        break;

    default:
        baseUrl = import.meta.env.VITE_DEV_API_URL;
}

const EnvConfig = {
    API_BASE_URL: baseUrl + "/api",
    BASE_URL: baseUrl,
};

export default EnvConfig;