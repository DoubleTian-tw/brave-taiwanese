export interface Shelter {
    id: string;
    name: string;
    address: string;
    phone: string;
    lat: number;
    lng: number;
    capacity: number;
    type: "hospital" | "school" | "community" | "government";
}

export interface Hotspot {
    id: string;
    lat: number;
    lng: number;
    title: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    photo?: string;
    createdAt: Date;
}

export type Language = "zh" | "en";
export type RadiusOption = 0.5 | 1 | 2 | 3 | 5;
export type SeverityLevel = "low" | "medium" | "high" | "critical";

export interface UserLocation {
    lat: number;
    lng: number;
}

// 新增設定選項介面
export interface MapSettings {
    radius: RadiusOption;
    enableOutOfRangeDetection: boolean;
    severityFilters: SeverityLevel[];
}

// 地圖邊界介面
export interface MapBounds {
    north: number;
    south: number;
    east: number;
    west: number;
}
