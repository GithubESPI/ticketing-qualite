// Script de test pour l'API Jira
// Ce fichier peut être utilisé pour tester la connexion Jira

import axios from 'axios';

// Configuration de test
const JIRA_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_JIRA_BASE_URL || 'https://votreentreprise.atlassian.net',
  email: process.env.NEXT_PUBLIC_JIRA_EMAIL || 'votre-email@exemple.com',
  apiToken: process.env.NEXT_PUBLIC_JIRA_API_TOKEN || 'votre-token-api-jira'
};

// Fonction de test de connexion
export const testJiraConnection = async () => {
  try {
    console.log('🧪 Test de connexion Jira...');
    console.log('📧 Email:', JIRA_CONFIG.email);
    console.log('🔗 Base URL:', JIRA_CONFIG.baseURL);
    console.log('🔑 Token:', JIRA_CONFIG.apiToken.substring(0, 10) + '...');

    // Créer l'instance Axios pour le test
    const axiosInstance = axios.create({
      baseURL: JIRA_CONFIG.baseURL,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    // Ajouter l'authentification
    const credentials = Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`).toString('base64');
    axiosInstance.defaults.headers.Authorization = `Basic ${credentials}`;

    // Test 1: Récupération des projets
    console.log('📋 Test 1: Récupération des projets...');
    const projectsResponse = await axiosInstance.get('/rest/api/3/project');
    console.log('✅ Projets récupérés:', {
      count: projectsResponse.data.length,
      projects: projectsResponse.data.map((p: any) => ({
        key: p.key,
        name: p.name,
        type: p.projectTypeKey
      }))
    });

    // Test 2: Informations utilisateur
    console.log('👤 Test 2: Informations utilisateur...');
    const userResponse = await axiosInstance.get('/rest/api/3/myself');
    console.log('✅ Utilisateur récupéré:', {
      accountId: userResponse.data.accountId,
      displayName: userResponse.data.displayName,
      emailAddress: userResponse.data.emailAddress
    });

    // Test 3: Recherche d'issues
    console.log('🔍 Test 3: Recherche d\'issues...');
    const issuesResponse = await axiosInstance.post('/rest/api/3/search', {
      jql: 'ORDER BY created DESC',
      maxResults: 5,
      fields: ['summary', 'status', 'priority', 'assignee', 'created']
    });
    console.log('✅ Issues trouvés:', {
      total: issuesResponse.data.total,
      count: issuesResponse.data.issues.length,
      issues: issuesResponse.data.issues.map((issue: any) => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name
      }))
    });

    console.log('🎉 Tous les tests Jira ont réussi !');
    return true;

  } catch (error: any) {
    console.error('❌ Erreur lors du test Jira:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    return false;
  }
};

// Fonction pour tester avec des credentials spécifiques
export const testWithCredentials = async (baseURL: string, email: string, apiToken: string) => {
  try {
    console.log('🧪 Test avec credentials spécifiques...');
    
    const axiosInstance = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const credentials = Buffer.from(`${email}:${apiToken}`).toString('base64');
    axiosInstance.defaults.headers.Authorization = `Basic ${credentials}`;

    const response = await axiosInstance.get('/rest/api/3/project');
    
    console.log('✅ Test réussi avec credentials:', {
      baseURL,
      email,
      projectsCount: response.data.length
    });
    
    return true;
  } catch (error: any) {
    console.error('❌ Test échoué avec credentials:', {
      baseURL,
      email,
      error: error.message
    });
    return false;
  }
};
