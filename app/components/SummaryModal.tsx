'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, AlertCircle, Info } from 'lucide-react';
import DateDisplay from './DateDisplay';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: {
    key: string;
    fields: {
      summary: string;
      description?: string;
      status?: { name: string };
      priority?: { name: string };
      issuetype?: { name: string };
      assignee?: { displayName: string; avatarUrls?: { '24x24': string } };
      reporter?: { displayName: string; avatarUrls?: { '24x24': string } };
      created: string;
      updated: string;
      project?: { name: string };
    };
  } | null;
}

export default function SummaryModal({ isOpen, onClose, issue }: SummaryModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || !issue) return null;

  const getStatusColor = (status: string) => {
    if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (status.toLowerCase()) {
      case 'done':
      case 'terminé':
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
      case 'en cours':
      case 'in review':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'to do':
      case 'nouveau':
      case 'open':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'blocked':
      case 'bloqué':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    if (!priority) return 'bg-gray-100 text-gray-800 border-gray-200';
    
    switch (priority.toLowerCase()) {
      case 'highest':
      case 'haute':
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
      case 'moyenne':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
      case 'normale':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
      case 'basse':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{issue.key}</h2>
                <p className="text-sm text-gray-500">{issue.fields.project?.name || 'Projet'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Résumé</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed">{issue.fields.summary}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Description
              </h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 shadow-sm">
                {issue.fields.description ? (
                  <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: issue.fields.description }} />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500 italic">
                    <AlertCircle className="w-4 h-4" />
                    <span>Aucune description fournie</span>
                  </div>
                )}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status & Priority */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Statut</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(issue.fields.status?.name || 'Inconnu')}`}>
                    {issue.fields.status?.name || 'Inconnu'}
                  </span>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Priorité</h4>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(issue.fields.priority?.name || 'Normal')}`}>
                    {issue.fields.priority?.name || 'Normal'}
                  </span>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Type</h4>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                    {issue.fields.issuetype?.name || 'Non défini'}
                  </span>
                </div>
              </div>

              {/* People & Dates */}
              <div className="space-y-4">
                {/* Assignee */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Assigné à</h4>
                  {issue.fields.assignee ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={issue.fields.assignee?.avatarUrls?.['24x24'] || '/default-avatar.png'}
                        alt={issue.fields.assignee?.displayName || 'Utilisateur'}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-700">{issue.fields.assignee?.displayName || 'Utilisateur'}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Non assigné</span>
                  )}
                </div>

                {/* Reporter */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Rapporté par</h4>
                  {issue.fields.reporter ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={issue.fields.reporter?.avatarUrls?.['24x24'] || '/default-avatar.png'}
                        alt={issue.fields.reporter?.displayName || 'Utilisateur'}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm text-gray-700">{issue.fields.reporter?.displayName || 'Utilisateur'}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Inconnu</span>
                  )}
                </div>

                {/* Dates */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Dates</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Créé: <DateDisplay date={issue.fields.created} format="datetime" /></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Modifié: <DateDisplay date={issue.fields.updated} format="datetime" /></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Champs personnalisés */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5 text-green-600" /> Informations Qualité
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">Action clôturée</h5>
                <Badge className={`${issue.fields.customfield_10001 === 'Oui' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} text-xs`}>
                  {issue.fields.customfield_10001 || 'Non défini'}
                </Badge>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">Action corrective</h5>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                  {issue.fields.customfield_10002 || 'Non défini'}
                </p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">Action curative</h5>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                  {issue.fields.customfield_10003 || 'Non défini'}
                </p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">Date de constatation</h5>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                  {issue.fields.customfield_10004 ? (
                    <DateDisplay date={issue.fields.customfield_10004} format="date" />
                  ) : (
                    'Non défini'
                  )}
                </p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">Date effective de réalisation</h5>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                  {issue.fields.customfield_10005 ? (
                    <DateDisplay date={issue.fields.customfield_10005} format="date" />
                  ) : (
                    'Non défini'
                  )}
                </p>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">Efficacité de l'action</h5>
                <Badge className={`${issue.fields.customfield_10006 === 'EFFICACE' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'} text-xs`}>
                  {issue.fields.customfield_10006 || 'Non défini'}
                </Badge>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-600 mb-1">Entité Origine</h5>
                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                  {issue.fields.customfield_10007 || 'Non défini'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Fermer
            </button>
            <a
              href={`https://groupe-espi.atlassian.net/browse/${issue.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4" />
              Voir dans Jira
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
