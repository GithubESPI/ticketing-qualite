'use client';

import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface ErrorAlertProps {
  error: string;
  onDismiss?: () => void;
}

export default function ErrorAlert({ error, onDismiss }: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 p-4 rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-amber-800">
            <span className="font-semibold">Note:</span> {error}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="ml-3 flex-shrink-0 text-amber-600 hover:text-amber-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
