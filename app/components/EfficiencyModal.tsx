'use client';

import React from 'react';
import { X, CheckCircle, AlertCircle, Clock, TrendingUp, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DateDisplay from './DateDisplay';

interface EfficiencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: {
    key: string;
    fields: {
      summary: string;
      customfield_10001?: string; // Action clôturée
      customfield_10002?: string; // Action corrective
      customfield_10003?: string; // Action curative
      customfield_10004?: string; // Date de constatation
      customfield_10005?: string; // Date effective de réalisation
      customfield_10006?: string; // Efficacité de l'action
      customfield_10007?: string; // Entité Origine
      status?: { name: string };
      priority?: { name: string };
      assignee?: { displayName: string; avatarUrls?: { '24x24': string } };
      reporter?: { displayName: string; avatarUrls?: { '24x24': string } };
      created: string;
      updated: string;
    };
  } | null;
}

const EfficiencyModal: React.FC<EfficiencyModalProps> = ({ isOpen, onClose, issue }) => {
  if (!isOpen || !issue) return null;

  const getEfficiencyColor = (efficiency: string) => {
    switch (efficiency?.toLowerCase()) {
      case 'efficace':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partiellement efficace':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'non efficace':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEfficiencyIcon = (efficiency: string) => {
    switch (efficiency?.toLowerCase()) {
      case 'efficace':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'partiellement efficace':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'non efficace':
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analyse d'Efficacité</h2>
                <p className="text-sm text-gray-600">{issue.key} - {issue.fields.summary}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl transition-all duration-200 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
            {/* Efficacité Principale */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200/50 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Efficacité de l'Action
              </h3>
              <div className="flex items-center gap-4">
                {getEfficiencyIcon(issue.fields.customfield_10006 || "")}
                <Badge className={`${getEfficiencyColor(issue.fields.customfield_10006 || "")} text-sm px-4 py-2`}>
                  {issue.fields.customfield_10006 || 'Non défini'}
                </Badge>
              </div>
            </div>

            {/* Actions Correctives et Curatives */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200/50 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  Action Corrective
                </h4>
                <div className="text-sm text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-gray-200">
                  {issue.fields.customfield_10002 ? (
                    <div dangerouslySetInnerHTML={{ __html: issue.fields.customfield_10002 }} />
                  ) : (
                    <span className="text-gray-500 italic">Aucune action corrective définie</span>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200/50 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Action Curative
                </h4>
                <div className="text-sm text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-gray-200">
                  {issue.fields.customfield_10003 ? (
                    <div dangerouslySetInnerHTML={{ __html: issue.fields.customfield_10003 }} />
                  ) : (
                    <span className="text-gray-500 italic">Aucune action curative définie</span>
                  )}
                </div>
              </div>
            </div>

            {/* Dates et Statut */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200/50 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  Dates Clés
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Date de constatation:</span>
                      <div className="text-sm text-gray-800">
                        {issue.fields.customfield_10004 ? (
                          <DateDisplay date={issue.fields.customfield_10004} format="date" />
                        ) : (
                          'Non définie'
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4 text-orange-600" />
                    <div>
                      <span className="text-sm font-medium text-gray-600">Date de réalisation:</span>
                      <div className="text-sm text-gray-800">
                        {issue.fields.customfield_10005 ? (
                          <DateDisplay date={issue.fields.customfield_10005} format="date" />
                        ) : (
                          'Non définie'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-200/50 shadow-sm">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-600 rounded-full"></div>
                  Informations Complémentaires
                </h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Action clôturée:</span>
                    <div className="mt-1">
                      <Badge className={`${issue.fields.customfield_10001 === 'Oui' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} text-xs`}>
                        {issue.fields.customfield_10001 || 'Non défini'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Entité Origine:</span>
                    <div className="text-sm text-gray-800 mt-1">
                      {issue.fields.customfield_10007 || 'Non définie'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Résumé de l'Efficacité */}
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200/50 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                Résumé de l'Analyse
              </h4>
              <div className="text-sm text-gray-700 bg-white/60 backdrop-blur-sm p-4 rounded-lg border border-gray-200">
                {issue.fields.customfield_10006 === 'EFFICACE' ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span>L'action a été efficace et a résolu le problème identifié.</span>
                  </div>
                ) : issue.fields.customfield_10006 === 'PARTIELLEMENT EFFICACE' ? (
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="w-4 h-4" />
                    <span>L'action a été partiellement efficace. Des améliorations sont nécessaires.</span>
                  </div>
                ) : issue.fields.customfield_10006 === 'NON EFFICACE' ? (
                  <div className="flex items-center gap-2 text-red-700">
                    <X className="w-4 h-4" />
                    <span>L'action n'a pas été efficace. Une nouvelle approche est requise.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4" />
                    <span>L'efficacité de l'action n'a pas encore été évaluée.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyModal;
