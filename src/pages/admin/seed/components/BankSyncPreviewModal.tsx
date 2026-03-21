import React from "react";
import { Landmark } from "lucide-react";
import { dataSyncApi } from "@/services/data-sync-api.service";
import SyncPreviewModal from "./SyncPreviewModal";

interface BankSyncPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSyncSuccess: () => void;
}

const BankSyncPreviewModal: React.FC<BankSyncPreviewModalProps> = ({ isOpen, onClose, onSyncSuccess }) => (
    <SyncPreviewModal
        isOpen={isOpen}
        onClose={onClose}
        onSyncSuccess={onSyncSuccess}
        title="Xem trước đồng bộ Ngân hàng"
        headerIcon={<Landmark className="w-5 h-5 text-primary" />}
        fetchPreview={dataSyncApi.previewBanks}
        executeSync={dataSyncApi.syncBanks}
        syncSuccessMessage="Đồng bộ ngân hàng thành công!"
        syncErrorMessage="Đồng bộ ngân hàng thất bại."
    />
);

export default BankSyncPreviewModal;
