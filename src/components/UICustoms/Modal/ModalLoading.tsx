import { DataLoader } from "../Snipper";

interface ModalLoadingProps {
    loading: boolean;
    message?: string;
    className?: string;
}

const ModalLoading: React.FC<ModalLoadingProps> = ({ 
    loading, 
    message = "Đang tải dữ liệu...",
    className = ""
}) => {
    if (!loading) return null;

    return (
        <div className={`absolute inset-0 bg-surface/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-xl animate-in fade-in duration-300 ${className}`}>
            <DataLoader size="md" text={message} />
        </div>
    );
};

export default ModalLoading;
