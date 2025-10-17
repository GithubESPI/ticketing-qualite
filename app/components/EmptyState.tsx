'use client';

import { AlertCircle, Search, Plus } from 'lucide-react';

interface EmptyStateProps {
  filter: string;
  onResetFilter?: () => void;
}

export default function EmptyState({ filter, onResetFilter }: EmptyStateProps) {
  const getFilterMessage = () => {
    switch (filter) {
      case 'cours':
        return 'Aucun ticket en cours';
      case 'terminé':
        return 'Aucun ticket terminé';
      case 'nouveau':
        return 'Aucun nouveau ticket';
      default:
        return 'Aucun ticket trouvé';
    }
  };

  return (
    <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="max-w-md mx-auto">
        {/* Icône animée */}
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Search className="w-10 h-10 text-blue-500" />
          </div>
          
          {/* Cercles animés autour de l'icône */}
          <div className="absolute inset-0 w-20 h-20 border-2 border-blue-200 rounded-full mx-auto animate-ping opacity-20"></div>
          <div className="absolute inset-0 w-20 h-20 border border-blue-300 rounded-full mx-auto animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
        </div>

        {/* Message principal */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {getFilterMessage()}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {filter === 'all' 
            ? 'Il semble qu\'il n\'y ait aucun ticket dans le système pour le moment.'
            : `Aucun ticket ne correspond au filtre "${filter}". Essayez de changer de filtre ou de créer un nouveau ticket.`
          }
        </p>

        {/* Actions suggérées */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {filter !== 'all' && onResetFilter && (
            <button
              onClick={onResetFilter}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Search className="w-4 h-4" />
              Voir tous les tickets
            </button>
          )}
          
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <Plus className="w-4 h-4" />
            Créer un ticket
          </button>
        </div>

        {/* Statistiques suggérées */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500 mb-2">Conseils :</p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Vérifiez que les filtres sont correctement appliqués</li>
            <li>• Assurez-vous que l'API est accessible</li>
            <li>• Contactez l'administrateur si le problème persiste</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
