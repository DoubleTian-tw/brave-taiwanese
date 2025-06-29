import React from "react";
import { Globe } from "lucide-react";
import { Language } from "../types";
import { translations } from "../utils/translations";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

interface LanguageSelectorProps {
    currentLanguage: Language;
    onLanguageChange: (language: Language) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    currentLanguage,
    onLanguageChange,
}) => {
    const t = translations[currentLanguage];

    return (
        <div className="relative z-[1100]">
            <Select value={currentLanguage} onValueChange={onLanguageChange}>
                <SelectTrigger className="pl-10 w-full">
                    <SelectValue placeholder={t.language} />
                </SelectTrigger>
                <SelectContent className="z-[1100]">
                    <SelectItem value="zh">{t.chinese}</SelectItem>
                    <SelectItem value="en">{t.english}</SelectItem>
                </SelectContent>
            </Select>
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
    );
};
