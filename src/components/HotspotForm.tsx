import React, { useState } from "react";
import { X, Camera, AlertTriangle } from "lucide-react";
import { Hotspot, Language } from "@/types";
import { translations } from "@/utils/translations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface HotspotFormProps {
    onSave: (hotspot: Omit<Hotspot, "id" | "createdAt">) => void;
    onCancel: () => void;
    position: { lat: number; lng: number };
    language: Language;
}

export const HotspotForm: React.FC<HotspotFormProps> = ({
    onSave,
    onCancel,
    position,
    language,
}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState<Hotspot["severity"]>("medium");
    const [photo, setPhoto] = useState<string>("");
    const t = translations[language];

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhoto(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        onSave({
            lat: position.lat,
            lng: position.lng,
            title: title.trim(),
            description: description.trim(),
            severity,
            photo: photo || undefined,
        });
    };

    const severityOptions: Array<{
        value: Hotspot["severity"];
        color: string;
    }> = [
        { value: "low", color: "bg-green-100 text-green-700 border-green-300" },
        {
            value: "medium",
            color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        },
        { value: "high", color: "bg-red-100 text-red-700 border-red-300" },
        { value: "critical", color: "bg-red-200 text-red-900 border-red-400" },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            <span>{t.addHotspot}</span>
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onCancel}
                            className="p-2">
                            <X className="h-5 w-5 text-gray-500" />
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.hotspotTitle}
                        </label>
                        <Input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.description}
                        </label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            {t.severity}
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {severityOptions.map(({ value, color }) => (
                                <Button
                                    key={value}
                                    type="button"
                                    variant={
                                        severity === value
                                            ? "default"
                                            : "outline"
                                    }
                                    onClick={() => setSeverity(value)}
                                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all duration-200 ${
                                        severity === value
                                            ? `${color} ring-2 ring-blue-500`
                                            : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                                    }`}>
                                    {t[value]}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t.uploadPhoto}
                        </label>
                        <div className="relative">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                className="hidden"
                                id="photo-upload"
                            />
                            <label
                                htmlFor="photo-upload"
                                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200">
                                {photo ? (
                                    <img
                                        src={photo}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="text-center">
                                        <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <span className="text-sm text-gray-500">
                                            {t.uploadPhoto}
                                        </span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1">
                            {t.cancel}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title.trim()}
                            className="flex-1">
                            {t.save}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
