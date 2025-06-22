import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface SearchBarProps {
  onSearch: (query: string) => void;
  language: Language;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, language }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`relative transition-all duration-200 ${isFocused ? 'scale-105' : ''}`}>
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t.searchPlaceholder}
          className={`w-full pl-12 pr-12 py-4 bg-white border rounded-2xl text-sm transition-all duration-200 shadow-lg ${
            isFocused
              ? 'border-blue-500 ring-2 ring-blue-100 shadow-2xl'
              : 'border-gray-300 hover:border-gray-400'
          } focus:outline-none backdrop-blur-sm bg-white/95`}
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>
    </form>
  );
};