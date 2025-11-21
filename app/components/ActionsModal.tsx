'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, MoreHorizontal, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DateDisplay from './DateDisplay';

interface ActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: {
    key: string;
    fields: {
      summary: string;
      description?: string;
      status?: { name: string };
      priority?: { name: string };
      customfield_10001?: string; // Action clôturée
      customfield_10002?: string; // Action corrective
      customfield_10003?: string; // Action curative
      customfield_10004?: string; // Date de constatation
      customfield_10005?: string; // Date effective de réalisation
      customfield_10006?: string; // Efficacité de l'action
      customfield_10007?: string; // Entité Origine (Campus)
      customfield_10008?: string; // Processus
      customfield_10117?: string; // Campus/Entité Origine
      customfield_10118?: string; // Processus PR7
      customfield_10132?: string; // Processus détaillé
      customfield_10121?: string; // Type d'utilisateur
      customfield_10122?: string; // Action curative (description)
      customfield_10116?: string; // Description du problème
      customfield_10120?: string; // Date de constatation
      customfield_10131?: string; // Champ personnalisé supplémentaire
      customfield_10130?: string; // Champ personnalisé supplémentaire
    };
  } | null;
}

export default function ActionsModal({ isOpen, onClose, issue }: ActionsModalProps) {
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
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <MoreHorizontal className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Actions pour {issue.key}</h2>
                <p className="text-sm text-gray-600">{issue.fields.summary}</p>
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
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Status & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {issue.fields.status && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50 shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2">Statut</h4>
                  <Badge className={`${getStatusColor(issue.fields.status.name)} text-xs px-3 py-1`}>
                    {issue.fields.status.name}
                  </Badge>
                </div>
              )}
              {issue.fields.priority && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200/50 shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-2">Priorité</h4>
                  <Badge className={`${getPriorityColor(issue.fields.priority.name)} text-xs px-3 py-1`}>
                    {issue.fields.priority.name}
                  </Badge>
                </div>
              )}
            </div>

            {/* Custom Fields */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" /> Informations Qualité
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {issue.fields.customfield_10001 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Action clôturée</h5>
                    <Badge className={`${issue.fields.customfield_10001 === 'Oui' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} text-xs`}>
                      {issue.fields.customfield_10001}
                    </Badge>
                  </div>
                )}
                {issue.fields.customfield_10002 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Action corrective</h5>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                      {issue.fields.customfield_10002}
                    </p>
                  </div>
                )}
                {issue.fields.customfield_10003 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Action curative</h5>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                      {issue.fields.customfield_10003}
                    </p>
                  </div>
                )}
                {issue.fields.customfield_10004 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Date de constatation</h5>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                      <DateDisplay date={issue.fields.customfield_10004} format="date" />
                    </p>
                  </div>
                )}
                {issue.fields.customfield_10005 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Date effective de réalisation</h5>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                      <DateDisplay date={issue.fields.customfield_10005} format="date" />
                    </p>
                  </div>
                )}
                {issue.fields.customfield_10006 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Efficacité de l'action</h5>
                    <Badge className={`${issue.fields.customfield_10006 === 'EFFICACE' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'} text-xs`}>
                      {issue.fields.customfield_10006}
                    </Badge>
                  </div>
                )}
                {issue.fields.customfield_10007 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Entité Origine</h5>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                      {issue.fields.customfield_10007}
                    </p>
                  </div>
                )}
                {issue.fields.customfield_10008 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Processus</h5>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                      {issue.fields.customfield_10008}
                    </p>
                  </div>
                )}
                {issue.fields.customfield_10117 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Campus</h5>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                      {issue.fields.customfield_10117}
                    </p>
                  </div>
                )}
                {issue.fields.customfield_10118 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Processus PR7</h5>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                      {issue.fields.customfield_10118}
                    </p>
                  </div>
                )}
                {issue.fields.customfield_10121 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Type d'utilisateur</h5>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                      {issue.fields.customfield_10121}
                    </p>
                  </div>
                )}
                {issue.fields.customfield_10120 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Date de constatation</h5>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                      <DateDisplay date={issue.fields.customfield_10120} format="date" />
                    </p>
                  </div>
                )}
                {issue.fields.customfield_10116 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Description du problème</h5>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                      {issue.fields.customfield_10116}
                    </p>
                  </div>
                )}
                {issue.fields.customfield_10122 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-600 mb-1">Action curative (description)</h5>
                    <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded border border-gray-200">
                      {issue.fields.customfield_10122}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <Button
              onClick={onClose}
              variant="outline"
            >
              Fermer
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
