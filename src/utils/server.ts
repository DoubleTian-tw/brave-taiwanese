import { supabaseClient } from "./client";
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
        const { data, error } = await supabaseClient.rpc(
            "get_hotspots_within_radius",
            {
                center_lat: lat,
                center_lng: lng,
                radius_km: radiusKm,
            }
        );

        if (error) {
            console.error("Error fetching hotspots by location:", error);
            return [];
        }

        return data.map((hotspot: Hotspot) => ({
            id: hotspot.id,
            lat: hotspot.lat,
            lng: hotspot.lng,
            title: hotspot.title,
            description: hotspot.description,
            severity: hotspot.severity,
            photo: hotspot.photo || undefined,
            createdAt: new Date(hotspot.createdAt),
        }));
    } catch (error) {
        console.error("Error fetching hotspots by location:", error);
        return [];
    }
}
