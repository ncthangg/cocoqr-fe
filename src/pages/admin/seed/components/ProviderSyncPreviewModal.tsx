import React from "react";
import { Layers } from "lucide-react";
import { dataSyncApi } from "@/services/data-sync-api.service";
import SyncPreviewModal from "./SyncPreviewModal";

interface ProviderSyncPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSyncSuccess: () => void;
}

const ProviderSyncPreviewModal: React.FC<ProviderSyncPreviewModalProps> = ({ isOpen, onClose, onSyncSuccess }) => (
    <SyncPreviewModal
        isOpen={isOpen}
        onClose={onClose}
        onSyncSuccess={onSyncSuccess}
        title="Xem trước đồng bộ Nhà cung cấp"
        headerIcon={<Layers className="w-5 h-5 text-violet-500" />}
        fetchPreview={dataSyncApi.previewProviders}
        executeSync={dataSyncApi.syncProviders}
        syncSuccessMessage="Đồng bộ nhà cung cấp thành công!"
        syncErrorMessage="Đồng bộ nhà cung cấp thất bại."
    />
);

export default ProviderSyncPreviewModal;
