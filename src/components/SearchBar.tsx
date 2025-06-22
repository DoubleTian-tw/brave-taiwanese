import React from "react";
import { Search } from "lucide-react";
import { Language } from "@/types";
import { translations } from "@/utils/translations";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
    onSearch: (query: string) => void;
    language: Language;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, language }) => {
    const t = translations[language];

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
                type="search"
                placeholder={t.searchPlaceholder}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2"
            />
        </div>
    );
};
