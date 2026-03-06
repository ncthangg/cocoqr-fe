import {
    createContext,
    useContext,
    useState,
    useEffect,
    type ReactNode,
} from "react";
import { finalizeSession, setSessionExpiredHandler } from "../services/auth-token.service";
import UnauthorizedModal from "../components/Modals/UnauthorizedModal";

interface UnauthorizedContextType {
    showUnauthorizedModal: () => void;
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

    const reset = () => setCountdown(initialSeconds);

    return { countdown, reset };
}

//#endregion

export function UnauthorizedProvider({ children }: UnauthorizedProviderProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleTimeout = () => {
        setIsOpen(false);
        finalizeSession();
        window.location.href = "/";
    };

    const { countdown, reset } = useUnauthorizedCountdown(
        isOpen,
        5,
        handleTimeout,
    );

    const showUnauthorizedModal = () => {
        setIsOpen(true);
        reset();
    };

    // Đăng ký để khi token hết hạn → mở modal
    useRegisterSessionExpiredHandler(showUnauthorizedModal);

    const handleGoToLogin = () => {
        setIsOpen(false);
        reset();
        finalizeSession();
        window.location.href = "/";
    };

    return (
        <UnauthorizedContext.Provider value={{ showUnauthorizedModal }}>
            {children}
            <UnauthorizedModal
                isOpen={isOpen}
                countdown={countdown}
                onGoToLogin={handleGoToLogin}
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
