import React from 'react';
import { X } from 'lucide-react';
import { Language, RadiusOption } from '../types';
import { translations } from '../utils/translations';
import { LanguageSelector } from './LanguageSelector';
import { RadiusSelector } from './RadiusSelector';

interface ToolbarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (language: Language) => void;
  radius: RadiusOption;
  onRadiusChange: (radius: RadiusOption) => void;
}

export const ToolbarMenu: React.FC<ToolbarMenuProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  radius,
  onRadiusChange,
}) => {
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-20 z-[999]"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="absolute bottom-56 right-4 bg-white rounded-2xl shadow-2xl border border-gray-200 z-[1000] min-w-64 animate-slide-up">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t.settings}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.language}
              </label>
              <LanguageSelector 
                currentLanguage={language} 
                onLanguageChange={onLanguageChange} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.radius}
              </label>
              <RadiusSelector 
                radius={radius} 
                onRadiusChange={onRadiusChange} 
                language={language} 
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};