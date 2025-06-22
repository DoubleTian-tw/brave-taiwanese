import React from "react";
import { X } from "lucide-react";

interface ToastProps {
    message: string;
    type: "success" | "error";
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const positionClass = "absolute top-5 left-1/2 -translate-x-1/2 z-[1000]";

    const baseToastClass =
        "rounded-lg shadow-lg p-3 flex items-center w-full max-w-sm";

    const typeStyles = {
        success: "bg-green-50 border border-green-200 text-green-700",
        error: "bg-red-50 border border-red-200 text-red-700 justify-between",
    };

    const toastClass = `${baseToastClass} ${typeStyles[type]}`;
    // const animationClass =
    //     type === "success" ? "animate-fade-in-out" : "animate-slide-up";

    return (
        <div className={`${positionClass}`}>
            <div className={toastClass}>
                <span className="text-sm">{message}</span>
                {type === "error" && (
                    <button
                        onClick={onClose}
                        className="-mr-1 p-1 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Close">
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
};
