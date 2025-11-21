'use client';

import { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionCurativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: {
    key: string;
    fields: {
      summary: string;
      customfield_10003?: string; // Action curative (ancien champ)
      customfield_10122?: string; // Action curative (description) - champ réel
    };
  } | null;
}

export default function ActionCurativeModal({ isOpen, onClose, issue }: ActionCurativeModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">Action Curative - {issue.key}</h2>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{issue.fields.summary}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 sm:p-3 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl transition-all duration-200 backdrop-blur-sm flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {(issue.fields.customfield_10122 && issue.fields.customfield_10122 !== 'Non défini') || 
             (issue.fields.customfield_10003 && issue.fields.customfield_10003 !== 'Non défini') ? (
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Détails de l'Action Curative</h3>
                <div className="text-sm sm:text-base text-gray-800 bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 whitespace-pre-wrap break-words">
                  {issue.fields.customfield_10122 && issue.fields.customfield_10122 !== 'Non défini' 
                    ? issue.fields.customfield_10122 
                    : issue.fields.customfield_10003}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-500 italic bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-gray-200">
                <Tag className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span>Aucune action curative définie pour cette issue.</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
