import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
    useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { finalizeSession, setSessionExpiredHandler } from "../services/auth-token.service";
import UnauthorizedModal, { type UnauthorizedType } from "../components/Modals/UnauthorizedModal";

interface UnauthorizedContextType {
    showSessionExpired: () => void;
    showNoPermission: (redirectPath: string) => void;
}

const UnauthorizedContext = createContext<UnauthorizedContextType | undefined>(
    undefined,
);

interface UnauthorizedProviderProps {
    children: ReactNode;
}

//#region FUNCTION
/** Hook: đăng ký handler với authTokenService khi session hết hạn */
function useRegisterSessionExpiredHandler(onExpired: () => void) {
    useEffect(() => {
        setSessionExpiredHandler(onExpired);
    }, [onExpired]);
}

/** Hook: quản lý đếm ngược và callback khi hết thời gian */
function useUnauthorizedCountdown(
    isOpen: boolean,
    initialSeconds: number,
    onTimeout: () => void,
) {
    const [countdown, setCountdown] = useState(initialSeconds);

    useEffect(() => {
        if (!isOpen) {
            // reset khi đóng modal
            setCountdown(initialSeconds);
            return;
        }

        if (countdown <= 0) {
            onTimeout();
            return;
        }

        const timer = window.setTimeout(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [isOpen, countdown, initialSeconds, onTimeout]);

    const reset = useCallback(() => {
        setCountdown(initialSeconds);
    }, [initialSeconds]);

    return { countdown, reset };
}

//#endregion

export function UnauthorizedProvider({ children }: UnauthorizedProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<UnauthorizedType>("SESSION_EXPIRED");
    const [redirectPath, setRedirectPath] = useState<string>("/");
    const navigate = useNavigate();

    const handleAction = useCallback(() => {
        setIsOpen(false);
        if (type === "SESSION_EXPIRED") {
            finalizeSession();
            navigate("/");
        } else {
            navigate(redirectPath);
        }
    }, [type, redirectPath, navigate]);

    const { countdown, reset } = useUnauthorizedCountdown(
        isOpen,
        10,
        handleAction,
    );

    const showSessionExpired = useCallback(() => {
        setType("SESSION_EXPIRED");
        setIsOpen(true);
        reset();
    }, [reset]);

    const showNoPermission = useCallback((path: string) => {
        setType("NO_PERMISSION");
        setRedirectPath(path);
        setIsOpen(true);
        reset();
    }, [reset]);

    // Đăng ký để khi token hết hạn → mở modal
    useRegisterSessionExpiredHandler(showSessionExpired);

    return (
        <UnauthorizedContext.Provider value={{ showSessionExpired, showNoPermission }}>
            {children}
            <UnauthorizedModal
                isOpen={isOpen}
                type={type}
                countdown={countdown}
                onAction={handleAction}
            />
        </UnauthorizedContext.Provider>
    );
}

export function useUnauthorized() {
    const context = useContext(UnauthorizedContext);
    if (context === undefined) {
        throw new Error(
            "useUnauthorized must be used within an UnauthorizedProvider",
        );
    }
    return context;
}
