"use client";
import { Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Crosshair, Settings } from "lucide-react";
import { toast } from "sonner";
import { Language, RadiusOption, Hotspot } from "../types";
import { useGeolocation } from "../hooks/useGeolocation";
import { translations } from "../utils/translations";
import { SearchBar } from "../components/SearchBar";
import { HotspotForm } from "@/components/HotspotForm";
import { ToolbarMenu } from "@/components/ToolbarMenu";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const MapContainer = dynamic(
    () => import("../components/MapContainer").then((mod) => mod.MapContainer),
    {
        ssr: false,
        loading: () => (
            <div className="fixed inset-0 bg-white flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    {/* 旋轉載入圖標 */}
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />

                    {/* 載入文字 */}
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

export default function Page() {
    const [language, setLanguage] = useState<Language>("zh");
    const [radius, setRadius] = useState<RadiusOption>(3);
    const [searchQuery, setSearchQuery] = useState("");
    const [hotspots, setHotspots] = useState<Hotspot[]>([]);
    const [showHotspotForm, setShowHotspotForm] = useState(false);
    const [showToolbar, setShowToolbar] = useState(false);
    const [newHotspotPosition, setNewHotspotPosition] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    const { location, loading, error, getCurrentLocation } = useGeolocation();
    const t = translations[language];

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

    useEffect(() => {
        if (hotspots.length > 0) {
            toast.success(
                language === "zh"
                    ? `已添加 ${hotspots.length} 個熱點`
                    : `${hotspots.length} hotspots added`
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hotspots.length]);

    const handleAddHotspot = (position: { lat: number; lng: number }) => {
        setNewHotspotPosition(position);
        setShowHotspotForm(true);
    };

    const handleSaveHotspot = (
        hotspotData: Omit<Hotspot, "id" | "createdAt">
    ) => {
        const newHotspot: Hotspot = {
            ...hotspotData,
            id: Date.now().toString(),
            createdAt: new Date(),
        };
        setHotspots((prev) => [...prev, newHotspot]);
        setShowHotspotForm(false);
        setNewHotspotPosition(null);
    };

    const handleCancelHotspot = () => {
        setShowHotspotForm(false);
        setNewHotspotPosition(null);
    };

    const handleLocationClick = () => {
        getCurrentLocation();
    };

    const toggleToolbar = () => {
        setShowToolbar(!showToolbar);
    };

    return (
        <div className="h-screen flex flex-col bg-gray-100">
            {/* Full Screen Map Container */}
            <div className="relative flex-1">
                {/* shadcn Dialog for add-hotspot hint */}
                <Dialog defaultOpen>
                    <DialogContent className="max-w-md mx-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {language === "zh"
                                    ? "點擊地圖任意位置添加熱點標記"
                                    : "Tap anywhere on the map to add a hotspot"}
                            </DialogTitle>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                <MapContainer
                    userLocation={location}
                    radius={radius}
                    searchQuery={searchQuery}
                    language={language}
                    hotspots={hotspots}
                    onAddHotspot={handleAddHotspot}
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
                />

                {/* Floating Location Button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={handleLocationClick}
                    disabled={loading}
                    className={`absolute bottom-24 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center z-[1000] transition-all duration-200 ${
                        loading
                            ? "cursor-not-allowed opacity-50"
                            : "hover:shadow-xl hover:scale-105 active:scale-95"
                    }`}
                    title={loading ? t.locationLoading : t.myLocation}>
                    <Crosshair
                        className={`h-6 w-6 text-blue-600 ${
                            loading ? "animate-spin" : ""
                        }`}
                    />
                </Button>
            </div>

            {/* Fixed Bottom Search Bar */}
            <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 w-1/3 min-w-80 z-[1000]">
                <SearchBar onSearch={setSearchQuery} language={language} />
            </div>

            {/* Hotspot Form Modal */}
            {showHotspotForm && newHotspotPosition && (
                <HotspotForm
                    onSave={handleSaveHotspot}
                    onCancel={handleCancelHotspot}
                    position={newHotspotPosition}
                    language={language}
                    open={showHotspotForm}
                />
            )}
        </div>
    );
}
