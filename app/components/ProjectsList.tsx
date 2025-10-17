// Composant pour afficher la liste des projets Jira
'use client';

import React, { useState, useEffect } from 'react';
import { JiraProject } from '../api/jira/projects';

interface ProjectsListProps {
  onProjectSelect?: (project: JiraProject) => void;
}

export default function ProjectsList({ onProjectSelect }: ProjectsListProps) {
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<JiraProject | null>(null);
  const [projectIssues, setProjectIssues] = useState<any[]>([]);
  const [issuesLoading, setIssuesLoading] = useState(false);

  // Récupérer tous les projets au chargement
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/projects');
      const data = await response.json();

      if (data.success) {
        setProjects(data.projects || []);
        console.log('📋 Projets récupérés:', data.projects?.length || 0);
      } else {
        setError(data.error || 'Erreur lors de la récupération des projets');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('❌ Erreur fetch projets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectIssues = async (projectKey: string) => {
    try {
      setIssuesLoading(true);

      const response = await fetch(`/api/projects?key=${projectKey}&action=issues&maxResults=20`);
      const data = await response.json();

      if (data.success) {
        setProjectIssues(data.issues || []);
        console.log('🎫 Issues récupérés:', data.issues?.length || 0);
      } else {
        console.error('❌ Erreur récupération issues:', data.error);
      }
    } catch (err) {
      console.error('❌ Erreur fetch issues:', err);
    } finally {
      setIssuesLoading(false);
    }
  };

  const handleProjectClick = async (project: JiraProject) => {
    setSelectedProject(project);
    await fetchProjectIssues(project.key);
    
    if (onProjectSelect) {
      onProjectSelect(project);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement des projets...</span>
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
            onClick={fetchProjects}
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
      {/* En-tête */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Projets Jira</h2>
            <p className="text-gray-600 mt-1">{projects.length} projets trouvés</p>
          </div>
          <button
            onClick={fetchProjects}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Actualiser"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Liste des projets */}
        <div className="w-1/2 border-r border-gray-200">
          <div className="p-4 max-h-96 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p>Aucun projet trouvé</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedProject?.id === project.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-800">{project.key}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{project.projectTypeKey}</span>
                        </div>
                        <h3 className="font-medium text-gray-800 mb-1">{project.name}</h3>
                        {project.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                        )}
                        {project.lead && (
                          <p className="text-xs text-gray-500 mt-1">
                            Lead: {project.lead.displayName}
                          </p>
                        )}
                      </div>
                      {project.avatarUrls && (
                        <img
                          src={project.avatarUrls['24x24']}
                          alt={project.name}
                          className="w-6 h-6 rounded"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Détails du projet sélectionné */}
        <div className="w-1/2">
          {selectedProject ? (
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {selectedProject.name}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Clé:</strong> {selectedProject.key}</p>
                  <p><strong>Type:</strong> {selectedProject.projectTypeKey}</p>
                  {selectedProject.lead && (
                    <p><strong>Lead:</strong> {selectedProject.lead.displayName}</p>
                  )}
                  {selectedProject.url && (
                    <p><strong>URL:</strong> 
                      <a href={selectedProject.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                        Voir dans Jira
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Issues du projet */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">Issues récentes</h4>
                  {issuesLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  )}
                </div>
                
                {projectIssues.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {projectIssues.map((issue) => (
                      <div key={issue.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{issue.key}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            issue.fields.status.name === 'Done' || issue.fields.status.name === 'Terminé'
                              ? 'bg-green-100 text-green-800'
                              : issue.fields.status.name === 'In Progress' || issue.fields.status.name === 'En cours'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {issue.fields.status.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{issue.fields.summary}</p>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>Priorité: {issue.fields.priority.name}</span>
                          <span>{new Date(issue.fields.created).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>Aucun issue trouvé</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Sélectionnez un projet pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
