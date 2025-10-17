// Fonction pour créer des tickets Jira (inspirée de votre app Python)
import axios from 'axios';
import { config } from '../../config/env';

// Interface pour les données de ticket
export interface TicketData {
  summary: string;
  description: string;
  issuetype?: string;
  priority?: string;
  assignee?: string;
}

// Fonction pour créer un document ADF (Atlassian Document Format)
export const createADFDescription = (text: string) => {
  return {
    version: 1,
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: text
          }
        ]
      }
    ]
  };
};

// Fonction pour créer un ticket Jira
export const createJiraTicket = async (ticketData: TicketData) => {
  try {
    console.log('🎫 Création d\'un ticket Jira...');
    console.log('📧 Email:', config.jira.email);
    console.log('🔑 Projet:', config.jira.projectKey);
    console.log('📝 Summary:', ticketData.summary);

    // Préparation des données pour Jira (inspiré de votre code Python)
    const issueData = {
      fields: {
        project: {
          key: config.jira.projectKey
        },
        summary: ticketData.summary,
        description: createADFDescription(ticketData.description),
        issuetype: {
          name: ticketData.issuetype || "[Système] Demande de service"
        },
        priority: ticketData.priority ? {
          name: ticketData.priority
        } : undefined,
        assignee: ticketData.assignee ? {
          name: ticketData.assignee
        } : undefined
      }
    };

    // Envoi de la requête POST à l'API Jira
    const response = await axios.post(
      `${config.jira.baseUrl}/rest/api/3/issue`,
      issueData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${btoa(`${config.jira.email}:${config.jira.apiToken}`)}`
        },
        timeout: 10000
      }
    );

    if (response.status === 201) {
      console.log('✅ Ticket créé avec succès:', response.data.key);
      return {
        success: true,
        key: response.data.key,
        id: response.data.id,
        url: `${config.jira.baseUrl}/browse/${response.data.key}`
      };
    } else {
      console.error('❌ Erreur création ticket:', response.status, response.data);
      return {
        success: false,
        error: `Erreur ${response.status}: ${response.data}`
      };
    }

  } catch (error: any) {
    console.error('❌ Erreur lors de la création du ticket:', error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      
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
};

// Fonction pour récupérer les types d'issues disponibles
export const getIssueTypes = async () => {
  try {
    const response = await axios.get(
      `${config.jira.baseUrl}/rest/api/3/issuetype`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${btoa(`${config.jira.email}:${config.jira.apiToken}`)}`
        },
        timeout: 10000
      }
    );

    return {
      success: true,
      issueTypes: response.data
    };
  } catch (error: any) {
    console.error('❌ Erreur récupération types d\'issues:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fonction pour récupérer les priorités disponibles
export const getPriorities = async () => {
  try {
    const response = await axios.get(
      `${config.jira.baseUrl}/rest/api/3/priority`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${btoa(`${config.jira.email}:${config.jira.apiToken}`)}`
        },
        timeout: 10000
      }
    );

    return {
      success: true,
      priorities: response.data
    };
  } catch (error: any) {
    console.error('❌ Erreur récupération priorités:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Fonction pour tester la connexion Jira
export const testJiraConnection = async () => {
  try {
    const response = await axios.get(
      `${config.jira.baseUrl}/rest/api/3/myself`,
      {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Basic ${btoa(`${config.jira.email}:${config.jira.apiToken}`)}`
        },
        timeout: 10000
      }
    );

    console.log('✅ Connexion Jira réussie !');
    console.log('👤 Utilisateur:', response.data.displayName);
    
    return {
      success: true,
      user: response.data
    };
  } catch (error: any) {
    console.error('❌ Erreur connexion Jira:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};
