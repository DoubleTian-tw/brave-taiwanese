"use client";
import React, { useState, useEffect, useRef } from "react";
import {
    MapContainer as LeafletMapContainer,
    TileLayer,
    Circle,
    useMapEvents,
    useMap,
} from "react-leaflet";
import { divIcon, marker as createMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import {
    Shelter,
    Hotspot,
    UserLocation,
    RadiusOption,
    Language,
} from "../types";
import { ShelterMarker } from "./ShelterMarker";
import { HotspotMarker } from "./HotspotMarker";
import { mockShelters } from "../data/mockShelters";

interface MapContainerProps {
    userLocation: UserLocation | null;
    radius: RadiusOption;
    searchQuery: string;
    language: Language;
    hotspots: Hotspot[];
    onAddHotspot: (position: { lat: number; lng: number }) => void;
}

const MapEventHandler: React.FC<{
    onMapClick: (position: { lat: number; lng: number }) => void;
}> = ({ onMapClick }) => {
    useMapEvents({
        click: (e) => {
            onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
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
            const location = event.detail;
            if (location && map) {
                map.setView([location.lat, location.lng], 15, {
                    animate: true,
                    duration: 1.0,
                });
            }
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

    useEffect(() => {
        if (userLocation && map) {
            map.setView([userLocation.lat, userLocation.lng], map.getZoom(), {
                animate: true,
                duration: 0.5,
            });
        }
    }, [userLocation, map]);

    return null;
};

const UserLocationMarker: React.FC<{ location: UserLocation }> = ({
    location,
}) => {
    const map = useMap();

    useEffect(() => {
        const userIcon = divIcon({
            html: `
        <div class="relative">
          <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 bg-opacity-20 rounded-full animate-ping"></div>
        </div>
      `,
            className: "user-location-marker",
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });

        const marker = createMarker([location.lat, location.lng], {
            icon: userIcon,
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
    onAddHotspot,
}) => {
    const [visibleShelters, setVisibleShelters] = useState<Shelter[]>([]);
    const [visibleHotspots, setVisibleHotspots] = useState<Hotspot[]>([]);
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

        const filteredHotspots = hotspots.filter((hotspot) => {
            const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                hotspot.lat,
                hotspot.lng
            );
            const matchesSearch = searchQuery
                ? hotspot.title
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                  hotspot.description
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                : true;

            return distance <= radiusInKm && matchesSearch;
        });

        setVisibleShelters(filteredShelters);
        setVisibleHotspots(filteredHotspots);
    }, [userLocation, radius, searchQuery, hotspots]);

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

            <MapEventHandler onMapClick={onAddHotspot} />
            <LocationUpdater userLocation={userLocation} />

            {userLocation && <UserLocationMarker location={userLocation} />}

            {userLocation && (
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
                />
            ))}

            {visibleHotspots.map((hotspot) => (
                <HotspotMarker
                    key={hotspot.id}
                    hotspot={hotspot}
                    language={language}
                />
            ))}
        </LeafletMapContainer>
    );
};
