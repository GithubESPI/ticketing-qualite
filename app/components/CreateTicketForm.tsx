// Composant pour créer des tickets Jira (inspiré de votre app Python)
'use client';

import React, { useState } from 'react';
import { createJiraTicket, getIssueTypes, getPriorities, testJiraConnection } from '../api/jira/create-ticket';
import { TicketData } from '../api/jira/create-ticket';

interface CreateTicketFormProps {
  onTicketCreated?: (ticketKey: string) => void;
}

export default function CreateTicketForm({ onTicketCreated }: CreateTicketFormProps) {
  const [formData, setFormData] = useState<TicketData>({
    summary: '',
    description: '',
    issuetype: '[Système] Demande de service',
    priority: 'Normal',
    assignee: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; ticketKey?: string } | null>(null);
  const [issueTypes, setIssueTypes] = useState<any[]>([]);
  const [priorities, setPriorities] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  // Tester la connexion au chargement
  React.useEffect(() => {
    const testConnection = async () => {
      const response = await testJiraConnection();
      setConnectionStatus(response.success);
      
      if (response.success) {
        // Charger les types d'issues et priorités
        const [typesResponse, prioritiesResponse] = await Promise.all([
          getIssueTypes(),
          getPriorities()
        ]);
        
        if (typesResponse.success) {
          setIssueTypes(typesResponse.issueTypes);
        }
        
        if (prioritiesResponse.success) {
          setPriorities(prioritiesResponse.priorities);
        }
      }
    };
    
    testConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await createJiraTicket(formData);
      
      if (response.success) {
        setResult({
          success: true,
          message: `Ticket créé avec succès !`,
          ticketKey: response.key
        });
        
        // Réinitialiser le formulaire
        setFormData({
          summary: '',
          description: '',
          issuetype: '[Système] Demande de service',
          priority: 'Normal',
          assignee: ''
        });
        
        // Notifier le parent
        if (onTicketCreated && response.key) {
          onTicketCreated(response.key);
        }
      } else {
        setResult({
          success: false,
          message: `Erreur: ${response.error}`
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Erreur inattendue: ${error}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Créer un ticket Jira</h2>
      
      {/* Status de connexion */}
      <div className="mb-4">
        {connectionStatus === null ? (
          <div className="flex items-center text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Test de connexion...
          </div>
        ) : connectionStatus ? (
          <div className="flex items-center text-green-600">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Connexion Jira réussie
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Connexion Jira échouée
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Summary */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            Résumé *
          </label>
          <input
            type="text"
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Résumé du ticket"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description détaillée du ticket"
          />
        </div>

        {/* Type d'issue */}
        <div>
          <label htmlFor="issuetype" className="block text-sm font-medium text-gray-700 mb-1">
            Type d'issue
          </label>
          <select
            id="issuetype"
            name="issuetype"
            value={formData.issuetype}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {issueTypes.length > 0 ? (
              issueTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))
            ) : (
              <option value="[Système] Demande de service">[Système] Demande de service</option>
            )}
          </select>
        </div>

        {/* Priorité */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priorité
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {priorities.length > 0 ? (
              priorities.map((priority) => (
                <option key={priority.id} value={priority.name}>
                  {priority.name}
                </option>
              ))
            ) : (
              <>
                <option value="Haute">Haute</option>
                <option value="Normal">Normal</option>
                <option value="Basse">Basse</option>
              </>
            )}
          </select>
        </div>

        {/* Assigné */}
        <div>
          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
            Assigné (optionnel)
          </label>
          <input
            type="text"
            id="assignee"
            name="assignee"
            value={formData.assignee}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Nom d'utilisateur Jira"
          />
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={loading || !connectionStatus}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            loading || !connectionStatus
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {loading ? 'Création en cours...' : 'Créer le ticket'}
        </button>
      </form>

      {/* Résultat */}
      {result && (
        <div className={`mt-4 p-4 rounded-md ${
          result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <div className={`flex items-center ${
            result.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {result.success ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {result.message}
          </div>
          {result.ticketKey && (
            <div className="mt-2">
              <a
                href={`https://groupe-espi.atlassian.net/browse/${result.ticketKey}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Voir le ticket: {result.ticketKey}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
