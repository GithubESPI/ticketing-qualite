'use client';

import { useState, useEffect } from 'react';
import { config } from '../config/env';
import { searchIssues, testJiraConnection } from '../api/jira';

// Fonction pour mapper les données de l'API vers notre format Ticket
const mapApiTicketToTicket = (apiTicket: any): Ticket => {
  console.log('🔄 Mapping du ticket API:', apiTicket);
  
  return {
    id: apiTicket.id || apiTicket.key || apiTicket.ticket_id || `TICKET-${Date.now()}`,
    summary: apiTicket.summary || apiTicket.title || apiTicket.subject || apiTicket.description || 'Sans titre',
    status: apiTicket.status || apiTicket.state || apiTicket.workflow_state || 'Nouveau',
    priority: apiTicket.priority || apiTicket.severity || 'Normal',
    assignee: apiTicket.assignee || apiTicket.assigned_to || apiTicket.owner || apiTicket.user_name || 'Non assigné',
    created: apiTicket.created || apiTicket.created_date || apiTicket.date_created || apiTicket.created_at || new Date().toISOString().split('T')[0],
    description: apiTicket.description || apiTicket.details || apiTicket.content || apiTicket.body || undefined,
    key: apiTicket.key || apiTicket.ticket_key,
    title: apiTicket.title || apiTicket.subject,
    assigned_to: apiTicket.assigned_to || apiTicket.owner,
    created_date: apiTicket.created_date || apiTicket.date_created
  };
};

// Fonction pour mapper les issues Jira vers notre format Ticket
const mapJiraIssueToTicket = (jiraIssue: any): Ticket => {
  console.log('🔄 Mapping de l\'issue Jira:', jiraIssue);
  
  return {
    id: jiraIssue.key || jiraIssue.id,
    summary: jiraIssue.fields?.summary || 'Sans titre',
    status: jiraIssue.fields?.status?.name || 'Nouveau',
    priority: jiraIssue.fields?.priority?.name || 'Normal',
    assignee: jiraIssue.fields?.assignee?.displayName || 'Non assigné',
    created: jiraIssue.fields?.created ? new Date(jiraIssue.fields.created).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    description: jiraIssue.fields?.description || undefined,
    key: jiraIssue.key,
    title: jiraIssue.fields?.summary,
    assigned_to: jiraIssue.fields?.assignee?.displayName,
    created_date: jiraIssue.fields?.created
  };
};

export interface Ticket {
  id: string;
  summary: string;
  status: string;
  priority: string;
  assignee: string;
  created: string;
  description?: string;
  key?: string;
  title?: string;
  assigned_to?: string;
  created_date?: string;
}

export interface TicketStats {
  total: number;
  enCours: number;
  termines: number;
}

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔗 Tentative de connexion à l\'API...');
      console.log('📧 Email utilisé:', config.jira.email);
      console.log('🔗 Base URL:', config.jira.baseUrl);

      // Essayer d'abord l'API Jira officielle si un token API Jira est configuré
      if (config.jira.apiToken && config.jira.apiToken !== 'votre-token-api-jira') {
        console.log('🎯 Tentative avec l\'API Jira officielle...');
        
        try {
          // Test de connexion Jira d'abord
          const isConnected = await testJiraConnection();
          
          if (isConnected) {
            // Récupération des issues du projet DYS uniquement avec la nouvelle API
            const issuesResponse = await searchIssues({
              jql: 'project = "DYS" ORDER BY created DESC',
              maxResults: 50
            });

            console.log('📊 Issues Jira récupérés:', {
              total: issuesResponse.total,
              count: issuesResponse.issues.length
            });
            
            // Mapper les issues Jira vers notre format Ticket
            const mappedTickets = issuesResponse.issues.map(mapJiraIssueToTicket);
            
            console.log('🔄 Tickets Jira mappés:', mappedTickets);
            setTickets(mappedTickets);
            return;
          }
        } catch (jiraError) {
          const jiraMsg = jiraError instanceof Error ? jiraError.message : String(jiraError);
          console.log('⚠️ API Jira échouée, fallback vers PowerBI:', jiraMsg);
        }
      }

      // Fallback vers l'API PowerBI
      console.log('🔄 Utilisation de l\'API PowerBI...');
      const { token, email, powerbiUrl } = config.jira;

      const response = await fetch(powerbiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${email}:${token}`)}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Statut de la réponse:', response.status);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Données reçues de l\'API PowerBI:', data);
      
      // L'API PowerBI retourne des métadonnées OData, nous devons accéder aux données réelles
      // Pour l'instant, utilisons les données de démonstration
      console.log('⚠️ API PowerBI retourne des métadonnées, utilisation des données de démonstration');
      
      // Données de démonstration améliorées
      const demoData = [
        {
          id: 'DEMO-1',
          summary: 'Ticket de démonstration 1',
          status: 'En cours',
          priority: 'Haute',
          assignee: 'Jean Dupont',
          created: '2025-01-15',
          description: 'Ceci est un ticket de démonstration'
        },
        {
          id: 'DEMO-2',
          summary: 'Ticket de démonstration 2',
          status: 'Terminé',
          priority: 'Moyenne',
          assignee: 'Marie Martin',
          created: '2025-01-10',
          description: 'Un autre ticket de démonstration'
        },
        {
          id: 'DEMO-3',
          summary: 'Ticket de démonstration 3',
          status: 'Nouveau',
          priority: 'Basse',
          assignee: 'Pierre Durand',
          created: '2025-01-20',
          description: 'Un troisième ticket de démonstration'
        }
      ];
      
      setTickets(demoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      // Données de démonstration en cas d'erreur
      setTickets([
        {
          id: 'DEMO-1',
          summary: 'Ticket de démonstration 1',
          status: 'En cours',
          priority: 'Haute',
          assignee: 'Jean Dupont',
          created: '2025-10-15',
          description: 'Ceci est un ticket de démonstration'
        },
        {
          id: 'DEMO-2',
          summary: 'Ticket de démonstration 2',
          status: 'Terminé',
          priority: 'Moyenne',
          assignee: 'Marie Martin',
          created: '2025-10-10',
          description: 'Un autre ticket de démonstration'
        },
        {
          id: 'DEMO-3',
          summary: 'Ticket de démonstration 3',
          status: 'Nouveau',
          priority: 'Basse',
          assignee: 'Pierre Durand',
          created: '2025-10-20',
          description: 'Un troisième ticket de démonstration'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const getStats = (): TicketStats => {
    return {
      total: tickets.length,
      enCours: tickets.filter(t => t.status?.toLowerCase().includes('cours') || t.status?.toLowerCase().includes('progress')).length,
      termines: tickets.filter(t => t.status?.toLowerCase().includes('terminé') || t.status?.toLowerCase().includes('done')).length
    };
  };

  const getFilteredTickets = (filter: string): Ticket[] => {
    if (filter === 'all') return tickets;
    return tickets.filter(ticket => 
      ticket.status?.toLowerCase().includes(filter)
    );
  };

  return {
    tickets,
    loading,
    error,
    fetchTickets,
    getStats,
    getFilteredTickets
  };
};
