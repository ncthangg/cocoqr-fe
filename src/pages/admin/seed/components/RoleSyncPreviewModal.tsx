import React from "react";
import { ShieldCheck } from "lucide-react";
import { dataSyncApi } from "@/services/data-sync-api.service";
import SyncPreviewModal from "./SyncPreviewModal";

interface RoleSyncPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSyncSuccess: () => void;
}

const RoleSyncPreviewModal: React.FC<RoleSyncPreviewModalProps> = ({ isOpen, onClose, onSyncSuccess }) => (
    <SyncPreviewModal
        isOpen={isOpen}
        onClose={onClose}
        onSyncSuccess={onSyncSuccess}
        title="Xem trước đồng bộ Phân quyền"
        headerIcon={<ShieldCheck className="w-5 h-5 text-amber-500" />}
        fetchPreview={dataSyncApi.previewRoles}
        executeSync={dataSyncApi.syncRoles}
        syncSuccessMessage="Đồng bộ phân quyền thành công!"
        syncErrorMessage="Đồng bộ phân quyền thất bại."
    />
);

export default RoleSyncPreviewModal;
