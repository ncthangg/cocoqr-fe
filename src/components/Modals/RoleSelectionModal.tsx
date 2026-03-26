import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/redux.hooks";
import { closeRoleSelectionModal, setCredentials } from "../../store/slices/auth.slice";
import { authApi } from "../../services/auth-api.service";
import { toast } from "react-toastify";
import { setCookie } from "../../utils/storage";
import { useNavigate } from "react-router-dom";
import { RouteConstant } from "../../constants/route.constant";
import { Shield, User, Loader2, LogOut } from "lucide-react";
import Button from "@/components/UICustoms/Button";

const RoleSelectionModal: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isRoleSelectionModalOpen, tempAuthData } = useAppSelector((state) => state.auth);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);

    if (!isRoleSelectionModalOpen || !tempAuthData) return null;

    const { userId, userRes, roleRes } = tempAuthData;

    const handleContinue = async () => {
        if (!selectedRoleId) return;
        setIsLoading(true);
        try {
            const res = await authApi.switchRole({ userId, roleId: selectedRoleId });

            // Set cookies
            setCookie("accessToken", res.tokenRes.accessToken ?? "", 60);
            setCookie("refreshToken", res.tokenRes.refreshToken ?? "", 60 * 24 * 7);

            // Set credentials in Redux
            dispatch(setCredentials({
                user: userRes,
                token: res.tokenRes,
                roles: [res.roleRes]
            }));

            // Navigate
            if (res.roleRes.name === "admin") {
                navigate(RouteConstant.ADMIN);
            } else {
                navigate(RouteConstant.USER);
            }

            toast.success(`Đăng nhập thành công với quyền ${res.roleRes.nameUpperCase}`);
            dispatch(closeRoleSelectionModal());
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Lỗi khi chọn quyền truy cập.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        if (isLoading) return;
        dispatch(closeRoleSelectionModal());
    };

    return (
        <div className="modal-overlay px-md py-lg">
            <div className="modal-content max-w-modal-sm w-full relative flex flex-col overflow-hidden rounded-2xl p-lg shadow-lg bg-surface animate-in zoom-in duration-300" onClick={e => e.stopPropagation()}>

                <div className="text-center mb-lg mt-sm">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-sm">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">Chọn Quyền Truy Cập</h3>
                    <p className="text-sm text-foreground-muted mt-2">
                        Vui lòng chọn vai trò để tiếp tục.
                    </p>
                </div>

                <div className="flex flex-row justify-center gap-md mb-xl">
                    {roleRes.map(role => {
                        const isSelected = selectedRoleId === role.id;
                        return (
                            <button
                                key={role.id}
                                type="button"
                                className={`group relative flex flex-col items-center justify-center p-lg min-w-[140px] bg-surface border-2 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden ${isSelected
                                    ? "border-primary bg-primary/5 scale-[1.05]"
                                    : "border-border/40 hover:border-primary/40"
                                    }`}
                                onClick={() => setSelectedRoleId(role.id)}
                                disabled={isLoading}
                            >
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-md transition-all duration-300 ${isSelected
                                    ? (role.name === 'admin' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white')
                                    : (role.name === 'admin' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500')
                                    }`}>
                                    {role.name === 'admin' ? <Shield className="w-7 h-7" /> : <User className="w-7 h-7" />}
                                </div>

                                <span className={`font-bold text-base transition-colors ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                                    {role.nameUpperCase}
                                </span>

                                {isSelected && (
                                    <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 bg-primary rounded-full text-white animate-in zoom-in duration-300">
                                        <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5"></div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-col gap-sm">
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleContinue}
                        disabled={!selectedRoleId || isLoading}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tiếp tục"}
                    </Button>

                    <button
                        type="button"
                        className="flex items-center justify-center mx-auto gap-xs text-sm text-foreground-muted hover:text-danger transition-colors mt-xs py-2"
                        onClick={handleLogout}
                        disabled={isLoading}
                    >
                        <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionModal;
