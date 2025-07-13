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
    address?: string;
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

// 地址相關介面
export interface AddressComponents {
    country?: string;
    state?: string;
    city?: string;
    town?: string;
    village?: string;
    road?: string;
    house_number?: string;
    postcode?: string;
    county?: string;
    suburb?: string;
    neighbourhood?: string;
}

export interface AddressInfo {
    formatted: string;
    components: AddressComponents;
    confidence: number;
}

export interface GeocodeResult {
    success: boolean;
    address?: AddressInfo;
    error?: string;
}
