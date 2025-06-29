import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Shelter, Language } from "../types";
import { translations } from "../utils/translations";
import { Building, Phone, Users, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShelterMarkerProps {
    shelter: Shelter;
    language: Language;
    onMarkerClick?: () => void;
}

const getShelterIcon = (type: Shelter["type"]) => {
    const colors = {
        hospital: "#EF4444",
        school: "#3B82F6",
        community: "#10B981",
        government: "#8B5CF6",
    };

    return L.divIcon({
        html: `
      <div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg" style="background-color: ${colors[type]}">
        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 1.66-.34 3.25-1.02 4.75-2.01V7l-3.75-5z"/>
        </svg>
      </div>
    `,
        className: "shelter-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

export const ShelterMarker: React.FC<ShelterMarkerProps> = ({
    shelter,
    language,
    onMarkerClick,
}) => {
    const t = translations[language];

    const handleNavigation = () => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${shelter.lat},${shelter.lng}`;
        window.open(url, "_blank");
    };

    return (
        <Marker
            position={[shelter.lat, shelter.lng]}
            icon={getShelterIcon(shelter.type)}
            eventHandlers={
                onMarkerClick ? { click: onMarkerClick } : undefined
            }>
            <Popup className="shelter-popup" maxWidth={300}>
                <div className="p-4 min-w-64">
                    <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 pr-2">
                            {shelter.name}
                        </h3>
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                shelter.type === "hospital"
                                    ? "bg-red-100 text-red-700"
                                    : shelter.type === "school"
                                    ? "bg-blue-100 text-blue-700"
                                    : shelter.type === "community"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-purple-100 text-purple-700"
                            }`}>
                            {t[shelter.type]}
                        </span>
                    </div>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-start space-x-2">
                            <Building className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                                {shelter.address}
                            </span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <a
                                href={`tel:${shelter.phone}`}
                                className="text-sm text-blue-600 hover:text-blue-800">
                                {shelter.phone}
                            </a>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                                {t.capacity}: {shelter.capacity}
                            </span>
                        </div>
                    </div>

                    <Button onClick={handleNavigation} className="w-full">
                        <Navigation className="h-4 w-4 mr-2" />
                        {t.goToShelter}
                    </Button>
                </div>
            </Popup>
        </Marker>
    );
};
