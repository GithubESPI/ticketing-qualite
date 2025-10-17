// API pour récupérer tous les projets du tenant Jira
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { config } from '../../config/env';

// Interface pour les données de projet
export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  description?: string;
  lead?: {
    displayName: string;
    emailAddress: string;
  };
  url?: string;
  avatarUrls?: {
    '16x16': string;
    '24x24': string;
    '32x32': string;
    '48x48': string;
  };
}

// Fonction pour récupérer tous les projets
export async function getProjects(): Promise<{ success: boolean; projects?: JiraProject[]; error?: string }> {
  // Filtrer uniquement le projet DYS (Ticketing Qualité)
  return getProjectDetails('DYS').then(result => {
    if (result.success && result.project) {
      console.log('✅ Projet DYS récupéré avec succès !');
      return {
        success: true,
        projects: [result.project]
      };
    } else {
      console.log('❌ Erreur récupération projet DYS:', result.error);
      return {
        success: false,
        error: result.error
      };
    }
  });
}

// Fonction pour récupérer les détails d'un projet spécifique
export async function getProjectDetails(projectKey: string): Promise<{ success: boolean; project?: JiraProject; error?: string }> {
  try {
    console.log(`🔍 Récupération des détails du projet: ${projectKey}`);

    const response = await axios.get(`${config.jira.baseUrl}/rest/api/3/project/${projectKey}`, {
      headers: {
        'Authorization': `Basic ${btoa(`${config.jira.email}:${config.jira.apiToken}`)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Détails du projet récupérés !');
    console.log('📋 Projet:', response.data.name);

    return {
      success: true,
      project: response.data
    };

  } catch (error: any) {
    console.error(`❌ Erreur récupération projet ${projectKey}:`, error.message);
    
    if (error.response) {
      return {
        success: false,
        error: `Erreur ${error.response.status}: ${JSON.stringify(error.response.data)}`
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Fonction pour récupérer les issues d'un projet
export async function getProjectIssues(projectKey: string, maxResults: number = 50): Promise<{ success: boolean; issues?: any[]; total?: number; error?: string }> {
  try {
    console.log(`🔍 Récupération des issues du projet: ${projectKey}`);

    // Utiliser la nouvelle API /rest/api/3/search/jql
    const response = await axios.get(`${config.jira.baseUrl}/rest/api/3/search/jql`, {
      params: {
        jql: `project = "${projectKey}" ORDER BY created DESC`,
        maxResults: maxResults,
        fields: 'key,summary,status,priority,assignee,created,updated'
      },
      headers: {
        'Authorization': `Basic ${btoa(`${config.jira.email}:${config.jira.apiToken}`)}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Issues du projet récupérés !');
    console.log('📊 Total issues:', response.data.total);
    console.log('📋 Issues récupérés:', response.data.issues.length);

    return {
      success: true,
      issues: response.data.issues,
      total: response.data.total
    };

  } catch (error: any) {
    console.error(`❌ Erreur récupération issues projet ${projectKey}:`, error.message);
    
    if (error.response) {
      return {
        success: false,
        error: `Erreur ${error.response.status}: ${JSON.stringify(error.response.data)}`
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}