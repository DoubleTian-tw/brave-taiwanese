import React, { useState } from 'react';
import { Crosshair, Plus, Settings } from 'lucide-react';
import { Language, RadiusOption, Hotspot } from './types';
import { useGeolocation } from './hooks/useGeolocation';
import { translations } from './utils/translations';
import { MapContainer } from './components/MapContainer';
import { SearchBar } from './components/SearchBar';
import { RadiusSelector } from './components/RadiusSelector';
import { LanguageSelector } from './components/LanguageSelector';
import { HotspotForm } from './components/HotspotForm';
import { ToolbarMenu } from './components/ToolbarMenu';

function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const [radius, setRadius] = useState<RadiusOption>(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [showHotspotForm, setShowHotspotForm] = useState(false);
  const [showToolbar, setShowToolbar] = useState(false);
  const [newHotspotPosition, setNewHotspotPosition] = useState<{ lat: number; lng: number } | null>(null);
  
  const { location, loading, error, getCurrentLocation } = useGeolocation();
  const t = translations[language];

  const handleAddHotspot = (position: { lat: number; lng: number }) => {
    setNewHotspotPosition(position);
    setShowHotspotForm(true);
  };

  const handleSaveHotspot = (hotspotData: Omit<Hotspot, 'id' | 'createdAt'>) => {
    const newHotspot: Hotspot = {
      ...hotspotData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setHotspots(prev => [...prev, newHotspot]);
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
        <MapContainer
          userLocation={location}
          radius={radius}
          searchQuery={searchQuery}
          language={language}
          hotspots={hotspots}
          onAddHotspot={handleAddHotspot}
        />

        {/* Floating Toolbar Button */}
        <button
          onClick={toggleToolbar}
          className={`absolute bottom-40 right-4 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center z-[1000] transition-all duration-200 ${
            showToolbar
              ? 'bg-blue-50 border-blue-300 scale-110'
              : 'hover:shadow-xl hover:scale-105 active:scale-95'
          }`}
          title={t.settings}
        >
          <Settings className={`h-6 w-6 ${showToolbar ? 'text-blue-600' : 'text-gray-600'} transition-colors duration-200`} />
        </button>

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
        <button
          onClick={handleLocationClick}
          disabled={loading}
          className={`absolute bottom-24 right-4 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center z-[1000] transition-all duration-200 ${
            loading
              ? 'cursor-not-allowed opacity-50'
              : 'hover:shadow-xl hover:scale-105 active:scale-95'
          }`}
          title={loading ? t.locationLoading : t.myLocation}
        >
          <Crosshair className={`h-6 w-6 text-blue-600 ${loading ? 'animate-spin' : ''}`} />
        </button>

        {/* Add Hotspot Hint */}
        <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center space-x-2">
              <Plus className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-blue-700 font-medium">
                {language === 'zh' ? '點擊地圖任意位置添加熱點標記' : 'Tap anywhere on the map to add a hotspot'}
              </span>
            </div>
          </div>
        </div>

        {/* Hotspot Count Display */}
        {hotspots.length > 0 && (
          <div className="absolute top-20 left-4 z-[1000] pointer-events-none">
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 shadow-sm">
              <span className="text-sm text-green-700 font-medium">
                {language === 'zh' ? `已添加 ${hotspots.length} 個熱點` : `${hotspots.length} hotspots added`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Search Bar */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-1/3 min-w-80 z-[1000]">
        <SearchBar onSearch={setSearchQuery} language={language} />
      </div>

      {/* Hotspot Form Modal */}
      {showHotspotForm && newHotspotPosition && (
        <HotspotForm
          onSave={handleSaveHotspot}
          onCancel={handleCancelHotspot}
          position={newHotspotPosition}
          language={language}
        />
      )}

      {/* Location Error Toast */}
      {error && (
        <div className="absolute top-20 left-4 right-4 z-[1000]">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm">
            <span className="text-sm text-red-700">{t.locationError}: {error}</span>
          </div>
        </div>
      )}

      {/* Location Success Toast */}
      {location && !loading && (
        <div className="absolute bottom-40 right-4 z-[1000] animate-fade-in-out">
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 shadow-sm">
            <span className="text-xs text-green-700">
              {language === 'zh' ? '位置已更新' : 'Location updated'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;