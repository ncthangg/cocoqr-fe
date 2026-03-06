import Cookies from "js-cookie";

// Cookie 
export const setCookie = (key: string, value: string, expiresInMinutes: number) => {
    Cookies.set(key, value, {
        expires: new Date(Date.now() + expiresInMinutes * 60 * 1000), // (phút)
        secure: true,
        sameSite: "Strict",
    });
};


export const getCookie = (key: string): string | undefined => {
    return Cookies.get(key);
};

export const removeCookie = (key: string) => {
    Cookies.remove(key);
};

// LocalStorage 
export const setToLocalStorage = (key: string, value: unknown): void => {
    if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

export const getFromLocalStorage = (key: string): unknown | null => {
    if (typeof window !== "undefined") {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }
    return null;
};

export const removeFromLocalStorage = (key: string): void => {
    if (typeof window !== "undefined") {
        localStorage.removeItem(key);
    }
};
