'use client';

import { Filter, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface FilterButtonsProps {
  currentFilter: string;
  onFilterChange: (filter: string) => void;
}

export default function FilterButtons({ currentFilter, onFilterChange }: FilterButtonsProps) {
  const filters = [
    { key: 'all', label: 'Tous', icon: Filter, color: 'blue' },
    { key: 'cours', label: 'En cours', icon: Clock, color: 'orange' },
    { key: 'terminé', label: 'Terminés', icon: CheckCircle, color: 'green' },
    { key: 'nouveau', label: 'Nouveaux', icon: AlertCircle, color: 'purple' }
  ];

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          const isActive = currentFilter === filter.key;
          const Icon = filter.icon;
          
          return (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              className={`
                group relative px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105
                flex items-center gap-2 shadow-sm border-2
                ${isActive 
                  ? `bg-gradient-to-r from-${filter.color}-500 to-${filter.color}-600 text-white border-${filter.color}-500 shadow-lg` 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                }
              `}
            >
              <Icon className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="relative z-10">{filter.label}</span>
              
              {/* Effet de brillance pour le bouton actif */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
              )}
              
              {/* Indicateur de sélection */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Indicateur de filtre actif */}
      <div className="mt-3 text-sm text-gray-500">
        <span className="inline-flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          Filtre actif: {filters.find(f => f.key === currentFilter)?.label}
        </span>
      </div>
    </div>
  );
}
