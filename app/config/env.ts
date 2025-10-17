// Configuration des variables d'environnement
export const config = {
  jira: {
    // Configuration pour l'API Jira officielle (inspirée de votre app Python)
    baseUrl: process.env.NEXT_PUBLIC_JIRA_BASE_URL || 'https://groupe-espi.atlassian.net',
    email: process.env.NEXT_PUBLIC_JIRA_EMAIL || 'informatique@groupe-espi.fr',
    apiToken: process.env.NEXT_PUBLIC_JIRA_API_TOKEN || 'VOTRE_API_KEY_ICI', // Remplacez par votre vraie API Key
    projectKey: process.env.NEXT_PUBLIC_JIRA_PROJECT_KEY || 'DYS',
    
    // Configuration PowerBI (fallback)
    powerbiUrl: process.env.NEXT_PUBLIC_JIRA_URL || 'https://powerbi-cloud-prod.alphaservesp.com/api/export/power-bi/29839696b013042357dcd158e97aeb2b',
    token: process.env.NEXT_PUBLIC_JIRA_TOKEN || '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
  }
};

// Validation des variables d'environnement
export const validateConfig = () => {
  const missingVars = [];
  
  if (!process.env.NEXT_PUBLIC_JIRA_TOKEN) {
    missingVars.push('NEXT_PUBLIC_JIRA_TOKEN');
  }
  
  if (!process.env.NEXT_PUBLIC_JIRA_EMAIL) {
    missingVars.push('NEXT_PUBLIC_JIRA_EMAIL');
  }
  
  if (!process.env.NEXT_PUBLIC_JIRA_URL) {
    missingVars.push('NEXT_PUBLIC_JIRA_URL');
  }
  
  if (missingVars.length > 0) {
    console.warn(`Variables d'environnement manquantes: ${missingVars.join(', ')}. Utilisation des valeurs par défaut.`);
  }
  
  return missingVars.length === 0;
};
