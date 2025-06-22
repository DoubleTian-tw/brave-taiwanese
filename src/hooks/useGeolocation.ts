import { useState, useEffect } from 'react';
import { UserLocation } from '../types';

export const useGeolocation = () => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);
        setLoading(false);
        
        // 觸發地圖重新定位到用戶位置
        const mapEvent = new CustomEvent('userLocationUpdate', { 
          detail: newLocation 
        });
        window.dispatchEvent(mapEvent);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError(error.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  useEffect(() => {
    // 初始載入時獲取位置
    getCurrentLocation();
  }, []);

  return { location, loading, error, getCurrentLocation };
};