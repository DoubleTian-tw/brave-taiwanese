import React from "react";
import { X } from "lucide-react";
import { Language, RadiusOption, SeverityLevel } from "../types";
import { translations } from "../utils/translations";
import { LanguageSelector } from "./LanguageSelector";
import { RadiusSelector } from "./RadiusSelector";
import { SeverityFilter } from "./SeverityFilter";
import { Button } from "@/components/ui/button";

interface ToolbarMenuProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    onLanguageChange: (language: Language) => void;
    radius: RadiusOption;
    onRadiusChange: (radius: RadiusOption) => void;
    enableOutOfRangeDetection: boolean;
    onToggleOutOfRangeDetection: (enabled: boolean) => void;
    selectedSeverities: SeverityLevel[];
    onSeverityChange: (severities: SeverityLevel[]) => void;
}

export const ToolbarMenu: React.FC<ToolbarMenuProps> = ({
    isOpen,
    onClose,
    language,
    onLanguageChange,
    radius,
    onRadiusChange,
    enableOutOfRangeDetection,
    onToggleOutOfRangeDetection,
    selectedSeverities,
    onSeverityChange,
}) => {
    const t = translations[language];

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-20 z-[999]"
                onClick={onClose}
            />

            {/* Menu Panel */}
            <div className="absolute bottom-56 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[1000] min-w-64 animate-slide-up">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {t.settings}
                        </h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="p-1">
                            <X className="h-5 w-5 text-gray-500" />
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.language}
                            </label>
                            <LanguageSelector
                                currentLanguage={language}
                                onLanguageChange={onLanguageChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.radius}
                            </label>
                            <RadiusSelector
                                radius={radius}
                                onRadiusChange={onRadiusChange}
                            />
                        </div>

                        {/* 範圍外偵測開關 */}
                        <div>
                            <label className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={enableOutOfRangeDetection}
                                    onChange={(e) =>
                                        onToggleOutOfRangeDetection(
                                            e.target.checked
                                        )
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {t.enableOutOfRangeDetection}
                                </span>
                            </label>
                        </div>

                        {/* 嚴重等級篩選 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t.severityFilter}
                            </label>
                            <SeverityFilter
                                selectedSeverities={selectedSeverities}
                                onSeverityChange={onSeverityChange}
                                language={language}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
