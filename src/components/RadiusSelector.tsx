import React from 'react';
import { MapPin } from 'lucide-react';
import { RadiusOption, Language } from '../types';
import { translations } from '../utils/translations';

interface RadiusSelectorProps {
  radius: RadiusOption;
  onRadiusChange: (radius: RadiusOption) => void;
  language: Language;
}

export const RadiusSelector: React.FC<RadiusSelectorProps> = ({
  radius,
  onRadiusChange,
  language,
}) => {
  const t = translations[language];
  const options: RadiusOption[] = [1, 3, 5];

  return (
    <div className="relative">
      <select
        value={radius}
        onChange={(e) => onRadiusChange(Number(e.target.value) as RadiusOption)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-10 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option} {t.km}
          </option>
        ))}
      </select>
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};