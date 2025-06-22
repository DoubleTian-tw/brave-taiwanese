export interface Shelter {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  capacity: number;
  type: 'hospital' | 'school' | 'community' | 'government';
}

export interface Hotspot {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  photo?: string;
  createdAt: Date;
}

export type Language = 'zh' | 'en';
export type RadiusOption = 1 | 3 | 5;

export interface UserLocation {
  lat: number;
  lng: number;
}