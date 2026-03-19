import React from 'react';

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
        <div className={`absolute inset-0 bg-surface/50 z-20 flex items-center justify-center rounded-xl fade-in ${className}`}>
            <div className="flex flex-col items-center gap-sm">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-sm"></div>
                <span className="text-sm font-semibold text-foreground tracking-wide">
                    {message}
                </span>
            </div>
        </div>
    );
};

export default ModalLoading;
