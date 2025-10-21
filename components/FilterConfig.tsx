'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Check, 
  X, 
  Filter,
  BarChart3,
  Users,
  Activity,
  Calendar,
  Clock
} from 'lucide-react';

interface FilterConfigProps {
  visibleFilters: {
    status: boolean;
    priority: boolean;
    assignee: boolean;
    processus: boolean;
    campus: boolean;
    userType: boolean;
    dateRange: boolean;
    customDate: boolean;
  };
  onToggleFilter: (filterKey: keyof FilterConfigProps['visibleFilters']) => void;
  onClose: () => void;
}

export default function FilterConfig({ visibleFilters, onToggleFilter, onClose }: FilterConfigProps) {
  const [tempFilters, setTempFilters] = useState(visibleFilters);

  const filterOptions = [
    {
      key: 'status' as const,
      label: 'Statut',
      description: 'Filtrer par statut des issues',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-700'
    },
    {
      key: 'priority' as const,
      label: 'Priorité',
      description: 'Filtrer par niveau de priorité',
      icon: Activity,
      color: 'bg-green-100 text-green-700'
    },
    {
      key: 'assignee' as const,
      label: 'Assigné',
      description: 'Filtrer par personne assignée',
      icon: Users,
      color: 'bg-purple-100 text-purple-700'
    },
    {
      key: 'processus' as const,
      label: 'Processus',
      description: 'Filtrer par processus métier',
      icon: Activity,
      color: 'bg-orange-100 text-orange-700'
    },
    {
      key: 'campus' as const,
      label: 'Campus',
      description: 'Filtrer par campus',
      icon: Users,
      color: 'bg-cyan-100 text-cyan-700'
    },
    {
      key: 'userType' as const,
      label: 'Type d\'utilisateur',
      description: 'Filtrer par type d\'utilisateur',
      icon: Users,
      color: 'bg-pink-100 text-pink-700'
    },
    {
      key: 'dateRange' as const,
      label: 'Période',
      description: 'Filtrer par période prédéfinie',
      icon: Calendar,
      color: 'bg-indigo-100 text-indigo-700'
    },
    {
      key: 'customDate' as const,
      label: 'Dates personnalisées',
      description: 'Filtrer par plage de dates spécifique',
      icon: Clock,
      color: 'bg-pink-100 text-pink-700'
    }
  ];

  const handleSave = () => {
    // Appliquer les changements
    Object.keys(tempFilters).forEach(key => {
      const filterKey = key as keyof typeof tempFilters;
      if (tempFilters[filterKey] !== visibleFilters[filterKey]) {
        onToggleFilter(filterKey);
      }
    });
    onClose();
  };

  const handleCancel = () => {
    setTempFilters(visibleFilters);
    onClose();
  };

  const toggleFilter = (key: keyof typeof tempFilters) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const activeFiltersCount = Object.values(tempFilters).filter(Boolean).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Configuration des Filtres
            </CardTitle>
            <CardDescription>
              Choisissez quels filtres afficher dans la sidebar pour personnaliser votre expérience
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium text-blue-900">Filtres actifs</p>
              <p className="text-sm text-blue-700">
                {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''} sélectionné{activeFiltersCount > 1 ? 's' : ''}
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
              {activeFiltersCount}/6
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filterOptions.map((option) => {
              const Icon = option.icon;
              const isActive = tempFilters[option.key];
              
              return (
                <div
                  key={option.key}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => toggleFilter(option.key)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${option.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900">{option.label}</h3>
                        {isActive && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            <Check className="w-3 h-3 mr-1" />
                            Actif
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              Les filtres sélectionnés apparaîtront dans la sidebar
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCancel}>
                Annuler
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Check className="w-4 h-4 mr-2" />
                Appliquer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
