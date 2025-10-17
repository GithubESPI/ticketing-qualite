'use client';

import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { TicketStats } from '../hooks/useTickets';

interface StatsCardsProps {
  stats: TicketStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total tickets',
      value: stats.total,
      icon: AlertCircle,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-500'
    },
    {
      title: 'En cours',
      value: stats.enCours,
      icon: Clock,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-500'
    },
    {
      title: 'Terminés',
      value: stats.termines,
      icon: CheckCircle,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-500'
    },
    {
      title: 'Taux de réussite',
      value: stats.total > 0 ? `${Math.round((stats.termines / stats.total) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={card.title}
          className={`bg-white rounded-xl shadow-lg p-6 border-t-4 ${card.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-105`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-500 text-sm font-medium mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{card.value}</p>
              
              {/* Barre de progression pour le taux de réussite */}
              {card.title === 'Taux de réussite' && (
                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`bg-gradient-to-r ${card.gradient} h-2 rounded-full transition-all duration-1000 ease-out`}
                      style={{ 
                        width: `${stats.total > 0 ? (stats.termines / stats.total) * 100 : 0}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className={`${card.bgColor} rounded-full p-4 shadow-sm`}>
              <card.icon className={`w-8 h-8 ${card.iconColor}`} />
            </div>
          </div>
          
          {/* Effet de brillance au survol */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      ))}
    </div>
  );
}
