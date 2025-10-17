'use client';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = "Chargement des tickets..." }: LoadingSpinnerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Spinner principal */}
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          
          {/* Spinner secondaire pour effet de profondeur */}
          <div className="absolute inset-0 animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-blue-400 mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          
          {/* Point central animé */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <p className="mt-6 text-gray-600 font-medium text-lg animate-pulse">
          {message}
        </p>
        
        {/* Barre de progression animée */}
        <div className="mt-4 w-64 mx-auto">
          <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
