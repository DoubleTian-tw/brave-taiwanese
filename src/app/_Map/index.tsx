"use client";
import { HotspotForm } from "@/components/HotspotForm";
import { SearchBar } from "@/components/SearchBar";
import { ToolbarMenu } from "@/components/ToolbarMenu";
import { Button } from "@/components/ui/button";
import { useGeolocation } from "@/hooks/useGeolocation";
import { supabaseClient } from "@/lib/supabase";
import {
    Hotspot,
    Language,
    MapBounds,
    RadiusOption,
    SeverityLevel,
} from "@/types";
import {
    deleteHotspot as deleteHotspotApi,
    getHotspots,
    getHotspotsByBounds,
    getHotspotsByLocation,
    updateHotspot,
    createHotspot,
} from "@/utils/server";
import { translations } from "@/utils/translations";
import { Crosshair, Loader2, Settings } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const MapContainer = dynamic(
    () => import("@/components/MapContainer").then((mod) => mod.MapContainer),
    {
        ssr: false,
        loading: () => (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                    <div className="text-center">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            載入中...
                        </h2>
                    </div>
                </div>
            </div>
        ),
    }
);

const Map = ({ serverHotspots }: { serverHotspots: Hotspot[] }) => {
    const [language, setLanguage] = useState<Language>("zh");
    const [radius, setRadius] = useState<RadiusOption>(3);
    const [searchQuery, setSearchQuery] = useState("");
    const [hotspots, setHotspots] = useState<Hotspot[]>(serverHotspots);
    const [showHotspotForm, setShowHotspotForm] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [newHotspotPosition, setNewHotspotPosition] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [editingHotspot, setEditingHotspot] = useState<Hotspot | null>(null);

    // 新增的狀態
    const [enableOutOfRangeDetection, setEnableOutOfRangeDetection] =
        useState(false);
    const [selectedSeverities, setSelectedSeverities] = useState<
        SeverityLevel[]
    >([]);
    const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
    const [_isDeleting, setIsDeleting] = useState(false);

    const { location, loading, error, getCurrentLocation } = useGeolocation();
    const t = translations[language];

    // 使用 useMemo 來穩定 mapBounds 的參考，避免無限循環
    const stableMapBounds = useMemo(() => {
        return mapBounds
            ? {
                  north: Number(mapBounds.north.toFixed(6)),
                  south: Number(mapBounds.south.toFixed(6)),
                  east: Number(mapBounds.east.toFixed(6)),
                  west: Number(mapBounds.west.toFixed(6)),
              }
            : null;
    }, [mapBounds?.north, mapBounds?.south, mapBounds?.east, mapBounds?.west]);

    // Supabase 即時監聽
    useEffect(() => {
        const channel = supabaseClient
            .channel("hotspots-changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "hotspots",
                },
                (payload) => {
                    console.log("Hotspot change:", payload);

                    if (payload.eventType === "INSERT") {
                        const newHotspot: Hotspot = {
                            id: payload.new.id,
                            lat: payload.new.lat,
                            lng: payload.new.lng,
                            title: payload.new.title,
                            description: payload.new.description,
                            severity: payload.new.severity,
                            photo: payload.new.photo_url || undefined,
                            createdAt: new Date(payload.new.created_at),
                        };
                        setHotspots((prev) => [...prev, newHotspot]);
                        toast.success(
                            language === "zh"
                                ? `新增熱點: ${newHotspot.title}`
                                : `New hotspot: ${newHotspot.title}`
                        );
                    } else if (payload.eventType === "UPDATE") {
                        const updatedHotspot: Hotspot = {
                            id: payload.new.id,
                            lat: payload.new.lat,
                            lng: payload.new.lng,
                            title: payload.new.title,
                            description: payload.new.description,
                            severity: payload.new.severity,
                            photo: payload.new.photo_url || undefined,
                            createdAt: new Date(payload.new.created_at),
                        };
                        setHotspots((prev) =>
                            prev.map((h) =>
                                h.id === updatedHotspot.id ? updatedHotspot : h
                            )
                        );
                        toast.success(
                            language === "zh"
                                ? `更新熱點: ${updatedHotspot.title}`
                                : `Updated hotspot: ${updatedHotspot.title}`
                        );
                    } else if (payload.eventType === "DELETE") {
                        setHotspots((prev) =>
                            prev.filter((h) => h.id !== payload.old.id)
                        );
                        toast.success(
                            language === "zh" ? "熱點已刪除" : "Hotspot deleted"
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabaseClient.removeChannel(channel);
        };
    }, [language]);

    // 根據設定載入熱點
    useEffect(() => {
        const loadHotspots = async () => {
            try {
                let newHotspots: Hotspot[] = [];

                if (enableOutOfRangeDetection && stableMapBounds) {
                    // 使用地圖邊界載入
                    newHotspots = await getHotspotsByBounds(
                        stableMapBounds.north,
                        stableMapBounds.south,
                        stableMapBounds.east,
                        stableMapBounds.west
                    );
                } else if (location) {
                    // 使用使用者位置和半徑載入
                    newHotspots = await getHotspotsByLocation(
                        location.lat,
                        location.lng,
                        radius
                    );
                } else {
                    // 載入所有熱點
                    newHotspots = await getHotspots();
                }

                setHotspots(newHotspots);
            } catch (error) {
                console.error("Error loading hotspots:", error);
                toast.error(
                    language === "zh"
                        ? "載入熱點失敗"
                        : "Failed to load hotspots"
                );
            }
        };

        // 添加防抖延遲，避免地圖邊界變化過於頻繁時重複載入
        const timeoutId = setTimeout(loadHotspots, 300);
        return () => clearTimeout(timeoutId);
    }, [
        location,
        radius,
        enableOutOfRangeDetection,
        stableMapBounds,
        language,
    ]);

    useEffect(() => {
        if (error) {
            toast.error(`${t.locationError}: ${error}`);
        }
    }, [error, t.locationError]);

    useEffect(() => {
        if (location && !loading) {
            toast.success(
                language === "zh" ? "位置已更新" : "Location updated",
                { id: "location" }
            );
        }
    }, [location, loading, language]);

    const handleAddHotspot = (position: { lat: number; lng: number }) => {
        setNewHotspotPosition(position);
        setEditingHotspot(null);
        setShowHotspotForm(true);
    };

    const handleEditHotspot = (hotspot: Hotspot) => {
        setEditingHotspot(hotspot);
        setNewHotspotPosition({ lat: hotspot.lat, lng: hotspot.lng });
        setShowHotspotForm(true);
    };

    const handleSaveHotspot = async (
        hotspotData: Omit<Hotspot, "id" | "createdAt">
    ) => {
        try {
            if (editingHotspot) {
                // 1. 先本地 optimistic update
                setHotspots((prev) =>
                    prev.map((h) =>
                        h.id === editingHotspot.id
                            ? { ...h, ...hotspotData }
                            : h
                    )
                );
                // 2. 再同步到 Supabase
                const updatedHotspot = await updateHotspot(editingHotspot.id, {
                    title: hotspotData.title,
                    description: hotspotData.description,
                    severity: hotspotData.severity,
                    photo: hotspotData.photo,
                });
                // 3. 若失敗，回滾本地狀態
                if (!updatedHotspot) {
                    // 重新 fetch 或 revert（這裡簡單做法：reload 全部）
                    const allHotspots = await getHotspots();
                    setHotspots(allHotspots);
                    toast.error(
                        language === "zh"
                            ? "熱點更新失敗，已還原"
                            : "Failed to update hotspot, reverted"
                    );
                } else {
                    toast.success(
                        language === "zh" ? "熱點已更新" : "Hotspot updated"
                    );
                }
            } else {
                // 新增熱點 optimistic update
                const tempId = "temp-" + Date.now();
                const optimisticHotspot: Hotspot = {
                    ...hotspotData,
                    id: tempId,
                    createdAt: new Date(),
                };
                setHotspots((prev) => [optimisticHotspot, ...prev]);

                // 呼叫 createHotspot 寫入資料庫
                const newHotspot = await createHotspot(hotspotData);

                // 若失敗，移除暫時 marker
                if (!newHotspot) {
                    setHotspots((prev) => prev.filter((h) => h.id !== tempId));
                    toast.error(
                        language === "zh"
                            ? "熱點新增失敗"
                            : "Failed to create hotspot"
                    );
                }
                // 若成功，等 Supabase 推播自動 patch
            }
        } catch (error) {
            console.error("Error saving hotspot:", error);
            toast.error(
                language === "zh" ? "儲存熱點失敗" : "Failed to save hotspot"
            );
        } finally {
            setShowHotspotForm(false);
            setNewHotspotPosition(null);
            setEditingHotspot(null);
        }
    };

    const handleDeleteHotspot = async (id: string) => {
        setIsDeleting(true);
        // 1. 先本地 optimistic update
        setHotspots((prev) => prev.filter((h) => h.id !== id));
        try {
            // 2. 再同步到 Supabase
            const success = await deleteHotspotApi(id);
            if (success) {
                toast.success(
                    language === "zh" ? "熱點已刪除" : "Hotspot deleted"
                );
            } else {
                // 3. 若失敗，回滾本地狀態
                const allHotspots = await getHotspots();
                setHotspots(allHotspots);
                toast.error(
                    language === "zh"
                        ? "刪除熱點失敗，已還原"
                        : "Failed to delete hotspot, reverted"
                );
            }
        } catch (error) {
            console.error("Error deleting hotspot:", error);
            // 回滾本地狀態
            const allHotspots = await getHotspots();
            setHotspots(allHotspots);
            toast.error(
                language === "zh" ? "刪除熱點失敗" : "Failed to delete hotspot"
            );
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelHotspot = () => {
        setShowHotspotForm(false);
        setNewHotspotPosition(null);
        setEditingHotspot(null);
    };

    const handleLocationClick = () => {
        getCurrentLocation();
    };

    const toggleToolbar = () => {
        setShowToolbar(!showToolbar);
    };

    const handleMapBoundsChange = (bounds: MapBounds) => {
        setMapBounds(bounds);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Full Screen Map Container */}
            <div className="relative flex-1">
                {/* 搜尋列 */}
                <div className="absolute top-4 left-4 right-4 z-[1000]">
                    <SearchBar onSearch={setSearchQuery} language={language} />
                </div>

                <MapContainer
                    userLocation={location}
                    radius={radius}
                    searchQuery={searchQuery}
                    language={language}
                    hotspots={hotspots}
                    enableOutOfRangeDetection={enableOutOfRangeDetection}
                    selectedSeverities={selectedSeverities}
                    onAddHotspot={handleAddHotspot}
                    onEditHotspot={handleEditHotspot}
                    onDeleteHotspot={handleDeleteHotspot}
                    onMapBoundsChange={handleMapBoundsChange}
                />

                {/* Floating Toolbar Button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleToolbar}
                    className={`absolute bottom-40 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-[1000] transition-all duration-200 ${
                        showToolbar
                            ? "bg-blue-50 border-blue-300 scale-110"
                            : "hover:shadow-xl hover:scale-105 active:scale-95"
                    }`}
                    title={t.settings}>
                    <Settings
                        className={`h-6 w-6 ${
                            showToolbar ? "text-blue-600" : "text-gray-600"
                        } transition-colors duration-200`}
                    />
                </Button>

                {/* Toolbar Menu */}
                <ToolbarMenu
                    isOpen={showToolbar}
                    onClose={() => setShowToolbar(false)}
                    language={language}
                    onLanguageChange={setLanguage}
                    radius={radius}
                    onRadiusChange={setRadius}
                    enableOutOfRangeDetection={enableOutOfRangeDetection}
                    onToggleOutOfRangeDetection={setEnableOutOfRangeDetection}
                    selectedSeverities={selectedSeverities}
                    onSeverityChange={setSelectedSeverities}
                />

                {/* Floating Location Button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleLocationClick}
                    disabled={loading}
                    className="absolute bottom-20 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-[1000] hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
                    title={loading ? t.locationLoading : t.myLocation}>
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    ) : (
                        <Crosshair className="h-6 w-6 text-gray-600" />
                    )}
                </Button>

                {/* Hotspot Form Dialog */}
                {showHotspotForm && newHotspotPosition && (
                    <HotspotForm
                        open={showHotspotForm}
                        position={newHotspotPosition}
                        language={language}
                        onSave={handleSaveHotspot}
                        onCancel={handleCancelHotspot}
                        editingHotspot={editingHotspot}
                    />
                )}
            </div>
        </div>
    );
};

export default Map;
