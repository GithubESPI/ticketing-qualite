// Composant spécialisé pour le projet DYS (Ticketing Qualité)
'use client';

import React, { useState, useEffect } from 'react';
import { JiraProject } from '../api/jira/projects';

interface DYSProjectViewProps {
  onIssueSelect?: (issue: any) => void;
}

export default function DYSProjectView({ onIssueSelect }: DYSProjectViewProps) {
  const [project, setProject] = useState<JiraProject | null>(null);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issuesLoading, setIssuesLoading] = useState(false);

  // Récupérer le projet DYS au chargement
  useEffect(() => {
    fetchDYSProject();
  }, []);

  const fetchDYSProject = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/projects?key=DYS&action=details');
      const data = await response.json();

      if (data.success) {
        setProject(data.project);
        console.log('📋 Projet DYS récupéré:', data.project);
        // Récupérer automatiquement les issues
        await fetchDYSIssues();
      } else {
        setError(data.error || 'Erreur lors de la récupération du projet DYS');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('❌ Erreur fetch projet DYS:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDYSIssues = async () => {
    try {
      setIssuesLoading(true);

      const response = await fetch('/api/projects?key=DYS&action=issues&maxResults=50');
      const data = await response.json();

      if (data.success) {
        setIssues(data.issues || []);
        console.log('🎫 Issues DYS récupérés:', data.issues?.length || 0);
      } else {
        console.error('❌ Erreur récupération issues DYS:', data.error);
        setError(data.error);
      }
    } catch (err) {
      console.error('❌ Erreur fetch issues DYS:', err);
      setError('Erreur de connexion pour les issues');
    } finally {
      setIssuesLoading(false);
    }
  };

  const handleIssueClick = (issue: any) => {
    if (onIssueSelect) {
      onIssueSelect(issue);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement du projet DYS...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDYSProject}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* En-tête du projet DYS */}
      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {project?.avatarUrls && (
              <img
                src={project.avatarUrls['48x48']}
                alt={project.name}
                className="w-12 h-12 rounded-lg"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{project?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
                  {project?.key}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-600">{project?.projectTypeKey}</span>
              </div>
              {project?.description && (
                <p className="text-gray-600 mt-2">{project.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={fetchDYSIssues}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Actualiser les issues"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Statistiques du projet */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{issues.length}</div>
            <div className="text-sm text-gray-600">Issues total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {issues.filter(issue => 
                issue.fields.status.name === 'In Progress' || 
                issue.fields.status.name === 'En cours'
              ).length}
            </div>
            <div className="text-sm text-gray-600">En cours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {issues.filter(issue => 
                issue.fields.status.name === 'Done' || 
                issue.fields.status.name === 'Terminé'
              ).length}
            </div>
            <div className="text-sm text-gray-600">Terminés</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {issues.filter(issue => 
                issue.fields.priority.name === 'High' || 
                issue.fields.priority.name === 'Haute'
              ).length}
            </div>
            <div className="text-sm text-gray-600">Priorité haute</div>
          </div>
        </div>
      </div>

      {/* Liste des issues */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Issues du projet DYS</h3>
          {issuesLoading && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600">Chargement...</span>
            </div>
          )}
        </div>
        
        {issues.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {issues.map((issue) => (
              <div 
                key={issue.id} 
                onClick={() => handleIssueClick(issue)}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-600">{issue.key}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      issue.fields.status.name === 'Done' || issue.fields.status.name === 'Terminé'
                        ? 'bg-green-100 text-green-800'
                        : issue.fields.status.name === 'In Progress' || issue.fields.status.name === 'En cours'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {issue.fields.status.name}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      issue.fields.priority.name === 'High' || issue.fields.priority.name === 'Haute'
                        ? 'bg-red-100 text-red-800'
                        : issue.fields.priority.name === 'Medium' || issue.fields.priority.name === 'Moyenne'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {issue.fields.priority.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(issue.fields.created).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className="text-gray-800 font-medium mb-1">{issue.fields.summary}</p>
                {issue.fields.assignee && (
                  <p className="text-sm text-gray-600">
                    Assigné à: {issue.fields.assignee.displayName}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Aucun issue trouvé dans le projet DYS</p>
          </div>
        )}
      </div>
    </div>
  );
}
