import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Camera, AlertTriangle } from "lucide-react";
import { Hotspot, Language, AddressInfo } from "@/types";
import { translations } from "@/utils/translations";
import { reverseGeocode } from "@/utils/geocoding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog";
import { uploadHotspotPhoto, createHotspot } from "@/utils/server";
import { toast } from "sonner";

interface HotspotFormProps {
    onSave: (hotspot: Omit<Hotspot, "id" | "createdAt">) => void;
    onCancel: () => void;
    position: { lat: number; lng: number };
    language: Language;
    open: boolean;
    editingHotspot?: Hotspot | null;
}

export const HotspotForm: React.FC<HotspotFormProps> = ({
    onSave,
    onCancel,
    position,
    language,
    open,
    editingHotspot,
}) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [severity, setSeverity] = useState<Hotspot["severity"]>("medium");
    const [photo, setPhoto] = useState<string | undefined>(undefined);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // 僅用於儲存，不顯示
    const [address, setAddress] = useState<AddressInfo | null>(null);
    const t = translations[language];

    useEffect(() => {
        if (editingHotspot) {
            setTitle(editingHotspot.title);
            setDescription(editingHotspot.description);
            setSeverity(editingHotspot.severity);
            setPhoto(editingHotspot.photo);
        } else {
            setTitle("");
            setDescription("");
            setSeverity("medium");
            setPhoto(undefined);
        }
        setPhotoFile(null);
    }, [editingHotspot, open]);

    // 自動取得地址，僅儲存不顯示
    useEffect(() => {
        if (open && position.lat && position.lng) {
            (async () => {
                try {
                    const result = await reverseGeocode(
                        position.lat,
                        position.lng
                    );
                    if (result.success && result.address) {
                        setAddress(result.address);
                    } else {
                        setAddress(null);
                    }
                } catch {
                    setAddress(null);
                }
            })();
        }
    }, [open, position.lat, position.lng]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhoto(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPhotoFile(null);
            setPhoto(editingHotspot?.photo);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        setIsSubmitting(true);

        try {
            let photoUrl: string | undefined = photo;
            if (photoFile) {
                const uploadedUrl = await uploadHotspotPhoto(photoFile);
                if (uploadedUrl == null) {
                    toast.error("照片上傳失敗");
                    setIsSubmitting(false);
                    return;
                }
                photoUrl = uploadedUrl;
            }
            const hotspotData = {
                lat: position.lat,
                lng: position.lng,
                title: title.trim(),
                description: description.trim(),
                severity,
                photo: photoUrl,
                address: address?.formatted,
            };
            if (editingHotspot) {
                onSave(hotspotData);
            } else {
                const newHotspot = await createHotspot(hotspotData);
                if (newHotspot) {
                    onSave(newHotspot);
                    toast.success(
                        language === "zh"
                            ? "熱點新增成功！"
                            : "Hotspot created!"
                    );
                } else {
                    toast.error(
                        language === "zh"
                            ? "熱點新增失敗"
                            : "Failed to create hotspot"
                    );
                    setIsSubmitting(false);
                    return;
                }
            }
        } catch (error) {
            console.error("Error saving hotspot:", error);
            toast.error(
                language === "zh"
                    ? "發生錯誤，請稍後再試"
                    : "An error occurred, please try again"
            );
            setIsSubmitting(false);
            return;
        }
        setIsSubmitting(false);
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
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (!v) onCancel();
            }}>
            <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto p-0 rounded-lg">
                <form onSubmit={handleSubmit} className="">
                    <DialogHeader className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                <span>
                                    {editingHotspot
                                        ? t.editHotspot
                                        : t.addHotspot}
                                </span>
                            </DialogTitle>
                            <DialogClose asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    type="button"
                                    className="p-2">
                                    <X className="h-5 w-5 text-gray-500" />
                                </Button>
                            </DialogClose>
                        </div>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
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
                                        <Image
                                            src={photo}
                                            alt="Preview"
                                            layout="fill"
                                            objectFit="cover"
                                            className="rounded-lg"
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
                    </div>
                    <DialogFooter className="flex flex-row space-x-3 pt-4 px-6 pb-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            className="flex-1"
                            disabled={isSubmitting}>
                            {t.cancel}
                        </Button>
                        <Button
                            type="submit"
                            disabled={!title.trim() || isSubmitting}
                            className="flex-1">
                            {isSubmitting
                                ? editingHotspot
                                    ? t.updating
                                    : "儲存中..."
                                : t.save}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
