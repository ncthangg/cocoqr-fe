import React, { useEffect, useState } from "react";
import { userRoleApi } from "../../../../services/userRole-api.service";
import type { GetUserBaseRes } from "../../../../models/entity.model";
import { toast } from "react-toastify";
import { X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserRolesViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: GetUserBaseRes | null;
}

const UserRolesViewModal: React.FC<UserRolesViewModalProps> = ({ isOpen, onClose, user }) => {
    const [roles, setRoles] = useState<GetUserBaseRes[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchRoles();
        } else {
            setRoles([]);
        }
    }, [isOpen, user]);

    const fetchRoles = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const data = await userRoleApi.getByUserId(user.userId);
            setRoles(data || []);
        } catch (error) {
            console.error("Failed to fetch roles for user", error);
            toast.error(`Unable to load roles for ${user.fullName}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm sm:p-0">
            <div className="bg-surface border border-border rounded-lg shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Roles for {user.fullName}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center p-6 text-muted-foreground">
                            Loading roles...
                        </div>
                    ) : roles.length > 0 ? (
                        <div className="space-y-2">
                            {roles.map((r, idx) => (
                                <div key={idx} className="flex flex-col p-3 rounded-md border border-border bg-surface hover:bg-muted/50 transition-colors">
                                    <span className="font-medium text-foreground">{(r as any).name || "Unknown Role"}</span>
                                    <span className="text-xs text-muted-foreground">{r.email || user.email}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-6 text-muted-foreground border border-dashed border-border rounded-md">
                            No roles assigned to this user.
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-border bg-muted/30">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserRolesViewModal;
