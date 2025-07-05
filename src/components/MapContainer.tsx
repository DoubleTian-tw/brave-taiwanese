"use client";
import { marker as createMarker, icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef, useState } from "react";
import {
    Circle,
    MapContainer as LeafletMapContainer,
    TileLayer,
    useMap,
    useMapEvents,
} from "react-leaflet";
import { mockShelters } from "../data/mockShelters";
import {
    Hotspot,
    Language,
    MapBounds,
    RadiusOption,
    SeverityLevel,
    Shelter,
    UserLocation,
} from "../types";
import { HotspotMarker } from "./HotspotMarker";
import { ShelterMarker } from "./ShelterMarker";

interface MapContainerProps {
    userLocation: UserLocation | null;
    radius: RadiusOption;
    searchQuery: string;
    language: Language;
    hotspots: Hotspot[];
    enableOutOfRangeDetection: boolean;
    selectedSeverities: SeverityLevel[];
    onAddHotspot: (position: { lat: number; lng: number }) => void;
    onEditHotspot?: (hotspot: Hotspot) => void;
    onDeleteHotspot?: (id: string) => void;
    onMapBoundsChange?: (bounds: MapBounds) => void;
}

const MapEventHandler: React.FC<{
    onMapClick: (position: { lat: number; lng: number }) => void;
    onBoundsChange?: (bounds: MapBounds) => void;
}> = ({ onMapClick, onBoundsChange }) => {
    const map = useMapEvents({
        click: (e) => {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
        moveend: () => {
            if (onBoundsChange) {
                const bounds = map.getBounds();
                onBoundsChange({
                    north: bounds.getNorth(),
                    south: bounds.getSouth(),
                    east: bounds.getEast(),
                    west: bounds.getWest(),
                });
            }
        },
        zoomend: () => {
            if (onBoundsChange) {
                const bounds = map.getBounds();
                onBoundsChange({
                    north: bounds.getNorth(),
                    south: bounds.getSouth(),
                    east: bounds.getEast(),
                    west: bounds.getWest(),
                });
            }
        },
    });
    return null;
};

const LocationUpdater: React.FC<{ userLocation: UserLocation | null }> = ({
    userLocation,
}) => {
    const map = useMap();

    useEffect(() => {
        const handleLocationUpdate = (event: CustomEvent) => {
            const { lat, lng } = event.detail;
            map.setView([lat, lng], map.getZoom());
        };

        window.addEventListener(
            "userLocationUpdate",
            handleLocationUpdate as EventListener
        );

        return () => {
            window.removeEventListener(
                "userLocationUpdate",
                handleLocationUpdate as EventListener
            );
        };
    }, [map]);

    return null;
};

const UserLocationMarker: React.FC<{ location: UserLocation }> = ({
    location,
}) => {
    const map = useMap();

    useEffect(() => {
        const userMarkerIcon = icon({
            iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="#3B82F6"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/></svg>'
            )}`,
            iconSize: [32, 32], // The size of the icon image.
            iconAnchor: [16, 32], // Point of the icon which will correspond to marker's location.
            popupAnchor: [0, -32], // Point from which the popup should open relative to the iconAnchor.
        });

        const marker = createMarker([location.lat, location.lng], {
            icon: userMarkerIcon,
        }).addTo(map);

        return () => {
            map.removeLayer(marker);
        };
    }, [location, map]);

    return null;
};

export const MapContainer: React.FC<MapContainerProps> = ({
    userLocation,
    radius,
    searchQuery,
    language,
    hotspots,
    enableOutOfRangeDetection,
    selectedSeverities,
    onAddHotspot,
    onEditHotspot,
    onDeleteHotspot,
    onMapBoundsChange,
}) => {
    const [visibleShelters, setVisibleShelters] = useState<Shelter[]>([]);
    const [visibleHotspots, setVisibleHotspots] = useState<Hotspot[]>([]);
    const [popupOpen, setPopupOpen] = useState(false);
    const [localMapBounds, setLocalMapBounds] = useState<MapBounds | null>(
        null
    );
    const mapRef = useRef<L.Map | null>(null);

    const defaultCenter: [number, number] = [25.033, 121.5654]; // Taipei
    const mapCenter = userLocation
        ? ([userLocation.lat, userLocation.lng] as [number, number])
        : defaultCenter;

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

    const isInMapBounds = (lat: number, lng: number, bounds: MapBounds) => {
        return (
            lat >= bounds.south &&
            lat <= bounds.north &&
            lng >= bounds.west &&
            lng <= bounds.east
        );
    };

    const handleBoundsChange = (bounds: MapBounds) => {
        // 僅當 bounds 真正有變化時才 setState
        if (
            !localMapBounds ||
            localMapBounds.north !== bounds.north ||
            localMapBounds.south !== bounds.south ||
            localMapBounds.east !== bounds.east ||
            localMapBounds.west !== bounds.west
        ) {
            setLocalMapBounds(bounds);
            onMapBoundsChange?.(bounds);
        }
    };

    // 避免 mapBounds 對象在每次渲染時都不同導致的無限循環
    const mapBoundsString = localMapBounds
        ? `${localMapBounds.north},${localMapBounds.south},${localMapBounds.east},${localMapBounds.west}`
        : "";

    useEffect(() => {
        if (!userLocation) {
            setVisibleShelters(mockShelters);
            setVisibleHotspots(hotspots);
            return;
        }

        const radiusInKm = radius;

        const filteredShelters = mockShelters.filter((shelter) => {
            const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                shelter.lat,
                shelter.lng
            );
            const matchesSearch = searchQuery
                ? shelter.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                  shelter.address
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                : true;

            return distance <= radiusInKm && matchesSearch;
        });

        let filteredHotspots = hotspots;

        // 應用嚴重等級篩選
        if (selectedSeverities.length > 0) {
            filteredHotspots = filteredHotspots.filter((hotspot) =>
                selectedSeverities.includes(hotspot.severity)
            );
        }

        // 根據範圍外偵測設定篩選熱點
        if (enableOutOfRangeDetection && localMapBounds) {
            // 啟用範圍外偵測：使用地圖邊界篩選
            filteredHotspots = filteredHotspots.filter((hotspot) =>
                isInMapBounds(hotspot.lat, hotspot.lng, localMapBounds)
            );
        } else {
            // 預設模式：使用使用者位置和半徑篩選
            filteredHotspots = filteredHotspots.filter((hotspot) => {
                const distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    hotspot.lat,
                    hotspot.lng
                );
                return distance <= radiusInKm;
            });
        }

        // 應用搜尋篩選到熱點
        if (searchQuery) {
            filteredHotspots = filteredHotspots.filter(
                (hotspot) =>
                    hotspot.title
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    hotspot.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
            );
        }

        setVisibleShelters(filteredShelters);
        setVisibleHotspots(filteredHotspots);
    }, [
        userLocation,
        radius,
        searchQuery,
        hotspots,
        enableOutOfRangeDetection,
        selectedSeverities,
        mapBoundsString,
    ]);

    const handleMapClick = (position: { lat: number; lng: number }) => {
        if (popupOpen) {
            setPopupOpen(false);
            if (mapRef.current) mapRef.current.closePopup();
            return;
        }
        onAddHotspot(position);
    };

    const handleMarkerClick = () => {
        setPopupOpen(true);
    };

    return (
        <LeafletMapContainer
            center={mapCenter}
            zoom={13}
            className="h-full w-full"
            zoomControl={false}
            ref={mapRef}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapEventHandler
                onMapClick={handleMapClick}
                onBoundsChange={handleBoundsChange}
            />
            <LocationUpdater userLocation={userLocation} />

            {userLocation && <UserLocationMarker location={userLocation} />}

            {userLocation && !enableOutOfRangeDetection && (
                <Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={radius * 1000}
                    pathOptions={{
                        color: "#3B82F6",
                        fillColor: "#3B82F6",
                        fillOpacity: 0.1,
                        weight: 2,
                    }}
                />
            )}

            {visibleShelters.map((shelter) => (
                <ShelterMarker
                    key={shelter.id}
                    shelter={shelter}
                    language={language}
                    onMarkerClick={handleMarkerClick}
                />
            ))}

            {visibleHotspots.map((hotspot) => (
                <HotspotMarker
                    key={hotspot.id}
                    hotspot={hotspot}
                    language={language}
                    onMarkerClick={handleMarkerClick}
                    onEditHotspot={onEditHotspot}
                    onDeleteHotspot={onDeleteHotspot}
                />
            ))}
        </LeafletMapContainer>
    );
};
