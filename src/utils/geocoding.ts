import { AddressInfo, GeocodeResult } from "@/types";

// OpenCage API 設定
const OPENCAGE_API_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
const OPENCAGE_BASE_URL = "https://api.opencagedata.com/geocode/v1/json";

/**
 * 使用 OpenCage API 將座標轉換為地址
 * @param lat 緯度
 * @param lng 經度
 * @returns Promise<GeocodeResult>
 */
export async function reverseGeocode(
    lat: number,
    lng: number
): Promise<GeocodeResult> {
    try {
        const url = `${OPENCAGE_BASE_URL}?q=${lat},${lng}&key=${OPENCAGE_API_KEY}&language=zh&countrycode=tw`;

        const response = await fetch(url);

        if (!response.ok) {
            console.warn("OpenCage API 請求失敗，使用備用方案");
            return getFallbackAddress(lat, lng);
        }

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const address: AddressInfo = {
                formatted: result.formatted,
                components: result.components,
                confidence: result.confidence,
            };

            return {
                success: true,
                address,
            };
        } else {
            return getFallbackAddress(lat, lng);
        }
    } catch (error) {
        console.error("OpenCage API 錯誤:", error);
        return getFallbackAddress(lat, lng);
    }
}

/**
 * 備用地址生成函數
 * @param lat 緯度
 * @param lng 經度
 * @returns GeocodeResult
 */
function getFallbackAddress(lat: number, lng: number): GeocodeResult {
    return {
        success: true,
        address: {
            formatted: `台灣地區 (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
            components: {
                country: "台灣",
                state: "示例縣市",
                city: "示例城市",
                road: "示例路段",
            },
            confidence: 5,
        },
    };
}

/**
 * 格式化地址顯示
 * @param address AddressInfo
 * @returns string
 */
export function formatAddressDisplay(address: AddressInfo): string {
    const components = address.components;
    const parts: string[] = [];

    if (components.country) parts.push(components.country);
    if (components.state) parts.push(components.state);
    if (components.city) parts.push(components.city);
    if (components.road) parts.push(components.road);

    return parts.length > 0 ? parts.join(", ") : address.formatted;
}

/**
 * 檢查地址是否在台灣範圍內
 * @param lat 緯度
 * @param lng 經度
 * @returns boolean
 */
export function isInTaiwan(lat: number, lng: number): boolean {
    // 台灣大致範圍
    const taiwanBounds = {
        north: 26.5,
        south: 21.5,
        east: 122.5,
        west: 119.5,
    };

    return (
        lat >= taiwanBounds.south &&
        lat <= taiwanBounds.north &&
        lng >= taiwanBounds.west &&
        lng <= taiwanBounds.east
    );
}
