import React from "react";
import { MapPin } from "lucide-react";
import { RadiusOption } from "../types";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

interface RadiusSelectorProps {
    radius: RadiusOption;
    onRadiusChange: (radius: RadiusOption) => void;
}

export const RadiusSelector: React.FC<RadiusSelectorProps> = ({
    radius,
    onRadiusChange,
}) => {
    const options: { value: RadiusOption; label: string }[] = [
        { value: 0.5 as RadiusOption, label: `500m` },
        { value: 1 as RadiusOption, label: `1km` },
        { value: 2 as RadiusOption, label: `2km` },
        { value: 3 as RadiusOption, label: `3km` },
        { value: 5 as RadiusOption, label: `5km` },
    ];

    return (
        <div className="relative">
            <Select
                value={String(radius)}
                onValueChange={(val) =>
                    onRadiusChange(Number(val) as RadiusOption)
                }>
                <SelectTrigger className="pl-10 w-full">
                    <SelectValue placeholder="選擇半徑" className="text-left" />
                </SelectTrigger>
                <SelectContent className="z-[1001]">
                    {options.map((option) => (
                        <SelectItem
                            key={option.value}
                            value={String(option.value)}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
        </div>
    );
};
