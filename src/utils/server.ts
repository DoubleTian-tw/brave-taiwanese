import { supabaseClient } from "@/lib/supabase";
import { Hotspot } from "@/types";

export interface CreateHotspotData {
    lat: number;
    lng: number;
    title: string;
    description: string;
    severity: Hotspot["severity"];
    photo?: string;
}

export interface HotspotWithPhoto extends Omit<Hotspot, "photo"> {
    photo_url?: string;
}

// 上傳照片到 Supabase Storage
export async function uploadHotspotPhoto(file: File): Promise<string | null> {
    try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `hotspot-photos/${fileName}`;

        const { data: _data, error } = await supabaseClient.storage
            .from("hotspot-photos")
            .upload(filePath, file);

        if (error) {
            console.error("Error uploading photo:", error);
            return null;
        }

        // 取得公開 URL
        const {
            data: { publicUrl },
        } = supabaseClient.storage
            .from("hotspot-photos")
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error("Error uploading photo:", error);
        return null;
    }
}

// 新增熱點
export async function createHotspot(
    hotspotData: CreateHotspotData
): Promise<Hotspot | null> {
    try {
        const { data, error } = await supabaseClient
            .from("hotspots")
            .insert({
                lat: hotspotData.lat,
                lng: hotspotData.lng,
                title: hotspotData.title,
                description: hotspotData.description,
                severity: hotspotData.severity,
                photo_url: hotspotData.photo || null,
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating hotspot:", error);
            return null;
        }

        return {
            id: data.id,
            lat: data.lat,
            lng: data.lng,
            title: data.title,
            description: data.description,
            severity: data.severity,
            photo: data.photo_url || undefined,
            createdAt: new Date(data.created_at),
        };
    } catch (error) {
        console.error("Error creating hotspot:", error);
        return null;
    }
}

// 取得所有熱點
export async function getHotspots(): Promise<Hotspot[]> {
    try {
        const { data, error } = await supabaseClient
            .from("hotspots")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching hotspots:", error);
            return [];
        }

        return data.map((hotspot) => ({
            id: hotspot.id,
            lat: hotspot.lat,
            lng: hotspot.lng,
            title: hotspot.title,
            description: hotspot.description,
            severity: hotspot.severity,
            photo: hotspot.photo_url || undefined,
            createdAt: new Date(hotspot.created_at),
        }));
    } catch (error) {
        console.error("Error fetching hotspots:", error);
        return [];
    }
}

// 根據位置和半徑取得熱點
export async function getHotspotsByLocation(
    lat: number,
    lng: number,
    radiusKm: number
): Promise<Hotspot[]> {
    try {
        // 不使用 RPC，改用簡單的邊界查詢
        // 計算大概的邊界 (這是一個近似值，不是精確的圓形)
        const latDiff = radiusKm / 111; // 大約 1 度緯度 = 111 km
        const lngDiff = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

        const { data, error } = await supabaseClient
            .from("hotspots")
            .select("*")
            .gte("lat", lat - latDiff)
            .lte("lat", lat + latDiff)
            .gte("lng", lng - lngDiff)
            .lte("lng", lng + lngDiff);

        if (error) {
            console.error("Error fetching hotspots by location:", error);
            return [];
        }

        // 在客戶端進行精確的距離計算
        const calculateDistance = (
            lat1: number,
            lng1: number,
            lat2: number,
            lng2: number
        ) => {
            const R = 6371; // Earth's radius in km
            const dLat = (lat2 - lat1) * (Math.PI / 180);
            const dLng = (lng2 - lng1) * (Math.PI / 180);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * (Math.PI / 180)) *
                    Math.cos(lat2 * (Math.PI / 180)) *
                    Math.sin(dLng / 2) *
                    Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        return data
            .filter(
                (hotspot) =>
                    calculateDistance(lat, lng, hotspot.lat, hotspot.lng) <=
                    radiusKm
            )
            .map((hotspot) => ({
                id: hotspot.id,
                lat: hotspot.lat,
                lng: hotspot.lng,
                title: hotspot.title,
                description: hotspot.description,
                severity: hotspot.severity,
                photo: hotspot.photo_url || undefined,
                createdAt: new Date(hotspot.created_at),
            }));
    } catch (error) {
        console.error("Error fetching hotspots by location:", error);
        return [];
    }
}

// 更新熱點
export async function updateHotspot(
    id: string,
    data: {
        title?: string;
        description?: string;
        severity?: "low" | "medium" | "high" | "critical";
        photo?: string;
    }
): Promise<Hotspot | null> {
    try {
        // 轉換欄位名稱
        const updateData: Record<string, unknown> = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.severity !== undefined) updateData.severity = data.severity;
        if (data.photo !== undefined) updateData.photo_url = data.photo;

        // 新增這段檢查
        if (Object.keys(updateData).length === 0) {
            console.error("No fields to update");
            return null;
        }
        const { data: hotspot, error } = await supabaseClient
            .from("hotspots")
            .update(updateData)
            .eq("id", id)
            .select("*")
            .maybeSingle();
        if (error || !hotspot) {
            console.error("Error updating hotspot:", error);
            return null;
        }

        return {
            id: hotspot.id,
            lat: hotspot.lat,
            lng: hotspot.lng,
            title: hotspot.title,
            description: hotspot.description,
            severity: hotspot.severity,
            photo: hotspot.photo_url || undefined,
            createdAt: new Date(hotspot.created_at),
        };
    } catch (error) {
        console.error("Error updating hotspot:", error);
        return null;
    }
}

// 刪除熱點
export async function deleteHotspot(id: string): Promise<boolean> {
    try {
        const { error } = await supabaseClient
            .from("hotspots")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Error deleting hotspot:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error deleting hotspot:", error);
        return false;
    }
}

// 根據地圖邊界取得熱點
export async function getHotspotsByBounds(
    north: number,
    south: number,
    east: number,
    west: number
): Promise<Hotspot[]> {
    try {
        const { data, error } = await supabaseClient
            .from("hotspots")
            .select("*")
            .gte("lat", south)
            .lte("lat", north)
            .gte("lng", west)
            .lte("lng", east);

        if (error) {
            console.error("Error fetching hotspots by bounds:", error);
            return [];
        }

        return data.map((hotspot) => ({
            id: hotspot.id,
            lat: hotspot.lat,
            lng: hotspot.lng,
            title: hotspot.title,
            description: hotspot.description,
            severity: hotspot.severity,
            photo: hotspot.photo_url || undefined,
            createdAt: new Date(hotspot.created_at),
        }));
    } catch (error) {
        console.error("Error fetching hotspots by bounds:", error);
        return [];
    }
}
