import React, { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { SeverityLevel, Language } from "../types";
import { translations } from "../utils/translations";
import { Button } from "@/components/ui/button";

interface SeverityFilterProps {
    selectedSeverities: SeverityLevel[];
    onSeverityChange: (severities: SeverityLevel[]) => void;
    language: Language;
}

export const SeverityFilter: React.FC<SeverityFilterProps> = ({
    selectedSeverities,
    onSeverityChange,
    language,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const t = translations[language];

    const severityOptions: {
        value: SeverityLevel;
        label: string;
        color: string;
    }[] = [
        { value: "low", label: t.low, color: "text-green-600" },
        { value: "medium", label: t.medium, color: "text-yellow-600" },
        { value: "high", label: t.high, color: "text-orange-600" },
        { value: "critical", label: t.critical, color: "text-red-600" },
    ];

    const handleSeverityToggle = (severity: SeverityLevel) => {
        if (selectedSeverities.includes(severity)) {
            onSeverityChange(selectedSeverities.filter((s) => s !== severity));
        } else {
            onSeverityChange([...selectedSeverities, severity]);
        }
    };

    const handleSelectAll = () => {
        if (selectedSeverities.length === severityOptions.length) {
            onSeverityChange([]);
        } else {
            onSeverityChange(severityOptions.map((opt) => opt.value));
        }
    };

    const displayValue =
        selectedSeverities.length === 0
            ? t.allSeverities
            : selectedSeverities.length === severityOptions.length
            ? t.allSeverities
            : `${selectedSeverities.length} 項已選`;

    return (
        <div className="relative">
            <Button
                variant="outline"
                className="w-full justify-between pl-10 pr-3"
                onClick={() => setIsOpen(!isOpen)}>
                <span className="text-left truncate">{displayValue}</span>
                <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                        isOpen ? "rotate-180" : ""
                    }`}
                />
            </Button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-[1001] max-h-48 overflow-y-auto">
                    <div className="p-2 space-y-2">
                        {/* 全選選項 */}
                        <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                                type="checkbox"
                                checked={
                                    selectedSeverities.length === 0 ||
                                    selectedSeverities.length ===
                                        severityOptions.length
                                }
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium">
                                {t.allSeverities}
                            </span>
                        </label>

                        {/* 分隔線 */}
                        <div className="border-t border-gray-200"></div>

                        {/* 各個嚴重等級選項 */}
                        {severityOptions.map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                    type="checkbox"
                                    checked={selectedSeverities.includes(
                                        option.value
                                    )}
                                    onChange={() =>
                                        handleSeverityToggle(option.value)
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className={`text-sm ${option.color}`}>
                                    {option.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />

            {/* 點擊外部關閉下拉選單 */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[1000]"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};
