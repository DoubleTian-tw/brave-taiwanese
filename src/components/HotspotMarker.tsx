import React, { useState } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Image from "next/image";
import { Hotspot, Language } from "../types";
import { translations } from "../utils/translations";
import { Calendar, Camera, MapPin, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

interface HotspotMarkerProps {
    hotspot: Hotspot;
    language: Language;
    onMarkerClick?: () => void;
    onEditHotspot?: (hotspot: Hotspot) => void;
    onDeleteHotspot?: (id: string) => void;
}

const getHotspotIcon = (severity: Hotspot["severity"]) => {
    const colors = {
        low: "#10B981",
        medium: "#F59E0B",
        high: "#EF4444",
        critical: "#7C2D12",
    };

    return L.divIcon({
        html: `
      <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg" style="background-color: ${colors[severity]}">
        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L1 21h22L12 2zm0 3.5L19.5 19h-15L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
        </svg>
      </div>
    `,
        className: "hotspot-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

export const HotspotMarker: React.FC<HotspotMarkerProps> = ({
    hotspot,
    language,
    onMarkerClick,
    onEditHotspot,
    onDeleteHotspot,
}) => {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const t = translations[language];

    const getSeverityColor = (severity: Hotspot["severity"]) => {
        switch (severity) {
            case "low":
                return "bg-green-100 text-green-700";
            case "medium":
                return "bg-yellow-100 text-yellow-700";
            case "high":
                return "bg-red-100 text-red-700";
            case "critical":
                return "bg-red-200 text-red-900";
        }
    };

    const handleEdit = () => {
        onEditHotspot?.(hotspot);
    };

    const handleDelete = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        onDeleteHotspot?.(hotspot.id);
        setShowDeleteDialog(false);
    };

    return (
        <>
            <Marker
                position={[hotspot.lat, hotspot.lng]}
                icon={getHotspotIcon(hotspot.severity)}
                eventHandlers={
                    onMarkerClick ? { click: onMarkerClick } : undefined
                }>
                <Popup className="hotspot-popup" maxWidth={300}>
                    <div className="p-4 min-w-64">
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 pr-2">
                                {hotspot.title}
                            </h3>
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                                    hotspot.severity
                                )}`}>
                                {t[hotspot.severity]}
                            </span>
                        </div>

                        <div className="space-y-3">
                            <p className="text-sm text-gray-600">
                                {hotspot.description}
                            </p>

                            {hotspot.photo && (
                                <div className="relative w-full h-32">
                                    <Image
                                        src={hotspot.photo}
                                        alt={hotspot.title}
                                        layout="fill"
                                        objectFit="cover"
                                        className="rounded-lg"
                                    />
                                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                                        <Camera className="h-3 w-3 text-white" />
                                    </div>
                                </div>
                            )}

                            <div className="border-t border-gray-100 pt-3 space-y-2">
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <MapPin className="h-3 w-3" />
                                    <span>{`Lat: ${hotspot.lat.toFixed(
                                        3
                                    )}, Lng: ${hotspot.lng.toFixed(3)}`}</span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        {hotspot.createdAt.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {/* 操作按鈕 */}
                            {(onEditHotspot || onDeleteHotspot) && (
                                <div className="border-t border-gray-100 pt-3">
                                    <div className="flex space-x-2">
                                        {onEditHotspot && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleEdit}
                                                className="flex-1 h-8 text-xs">
                                                <Edit className="h-3 w-3 mr-1" />
                                                {t.edit}
                                            </Button>
                                        )}
                                        {onDeleteHotspot && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleDelete}
                                                className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                {t.delete}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Popup>
            </Marker>

            {/* 刪除確認對話框 */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="max-w-md mx-auto rounded-lg">
                    <DialogHeader>
                        <DialogTitle>{t.confirmDelete}</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-gray-600">
                            {t.deleteHotspotConfirm}
                        </p>
                        <p className="text-sm font-medium text-gray-900 mt-2">
                            "{hotspot.title}"
                        </p>
                    </div>
                    <DialogFooter className="flex flex-row space-x-3">
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                            className="flex-1">
                            {t.cancel}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmDelete}
                            className="flex-1">
                            {t.delete}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
