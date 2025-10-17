'use client';

import { useState } from 'react';
import { useTickets } from './hooks/useTickets';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorAlert from './components/ErrorAlert';
import StatsCards from './components/StatsCards';
import FilterButtons from './components/FilterButtons';
import TicketCard from './components/TicketCard';
import EmptyState from './components/EmptyState';
import ApiDebugger from './components/ApiDebugger';
import ApiTester from './components/ApiTester';
import JiraApiTester from './components/JiraApiTester';
import ConfigurationGuide from './components/ConfigurationGuide';
import CreateTicketForm from './components/CreateTicketForm';
import DYSProjectView from './components/DYSProjectView';
import { RefreshCw, Settings, Bell, User, Bug, TestTube, Zap, HelpCircle, FolderOpen } from 'lucide-react';

export default function JiraDashboard() {
  const [filter, setFilter] = useState('all');
  const [showDebugger, setShowDebugger] = useState(false);
  const [showApiTester, setShowApiTester] = useState(false);
  const [showJiraTester, setShowJiraTester] = useState(false);
  const [showConfigGuide, setShowConfigGuide] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const { tickets, loading, error, fetchTickets, getStats, getFilteredTickets } = useTickets();

  const stats = getStats();
  const filteredTickets = getFilteredTickets(filter);

  const handleRefresh = () => {
    fetchTickets();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* En-tête avec navigation */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tableau de bord Jira
              </h1>
              <p className="text-gray-600 mt-1">Gestion et suivi de vos tickets</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Actualiser"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDebugger(!showDebugger)}
                className={`p-2 rounded-lg transition-colors ${
                  showDebugger 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
                title="Debug API"
              >
                <Bug className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowApiTester(true)}
                className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                title="Tester l'API"
              >
                <TestTube className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowJiraTester(true)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Tester l'API Jira"
              >
                <Zap className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowConfigGuide(true)}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Guide de configuration"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className={`p-2 rounded-lg transition-colors ${
                  showCreateForm 
                    ? 'text-green-600 bg-green-50' 
                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
                title="Créer un ticket"
              >
                <User className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowProjects(!showProjects)}
                className={`p-2 rounded-lg transition-colors ${
                  showProjects 
                    ? 'text-purple-600 bg-purple-50' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
                title="Voir le projet DYS"
              >
                <FolderOpen className="w-5 h-5" />
              </button>
              <a
                href="/dashboard"
                className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Dashboard DYS"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </a>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Message d'erreur */}
        {error && (
          <ErrorAlert 
            error={`Connexion à l'API en cours... Affichage des données de démonstration.`}
          />
        )}

        {/* Statistiques */}
        <StatsCards stats={stats} />

        {/* Filtres */}
        <FilterButtons 
          currentFilter={filter} 
          onFilterChange={setFilter} 
        />

        {/* Liste des tickets */}
        <div className="space-y-4">
          {filteredTickets.length > 0 ? (
            filteredTickets.map((ticket, index) => (
              <TicketCard 
                key={ticket.id || index} 
                ticket={ticket} 
                index={index} 
              />
            ))
          ) : (
            <EmptyState 
              filter={filter} 
              onResetFilter={() => setFilter('all')} 
            />
          )}
        </div>

        {/* Pied de page avec informations */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>Dernière mise à jour: {new Date().toLocaleString('fr-FR')}</span>
              <span>•</span>
              <span>{tickets.length} tickets au total</span>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Système opérationnel</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Debugger API */}
      <ApiDebugger 
        isVisible={showDebugger} 
        onToggle={() => setShowDebugger(false)} 
      />

      {/* Testeur API */}
      <ApiTester 
        isVisible={showApiTester} 
        onClose={() => setShowApiTester(false)} 
      />

      {/* Testeur API Jira */}
      <JiraApiTester 
        isVisible={showJiraTester} 
        onClose={() => setShowJiraTester(false)} 
      />

      {/* Guide de configuration */}
      <ConfigurationGuide 
        isVisible={showConfigGuide} 
        onClose={() => setShowConfigGuide(false)} 
      />

      {/* Formulaire de création de ticket */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Créer un ticket Jira</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <CreateTicketForm 
                onTicketCreated={(ticketKey) => {
                  console.log('Ticket créé:', ticketKey);
                  setShowCreateForm(false);
                  // Actualiser la liste des tickets
                  fetchTickets();
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Liste des projets */}
      {showProjects && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Projet DYS - Ticketing Qualité</h2>
                <button
                  onClick={() => setShowProjects(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <DYSProjectView 
                onIssueSelect={(issue) => {
                  console.log('Issue sélectionné:', issue);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}