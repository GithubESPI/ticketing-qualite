'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  User,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Info
} from 'lucide-react';
import DateDisplay from '../components/DateDisplay';
import SummaryModal from '../components/SummaryModal';
import EfficiencyModal from '../components/EfficiencyModal';

interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    status?: {
      name: string;
      statusCategory?: {
        colorName: string;
      };
    };
    priority?: {
      name: string;
      iconUrl?: string;
    };
    assignee?: {
      displayName: string;
      avatarUrls: {
        '24x24': string;
      };
    };
    reporter: {
      displayName: string;
      avatarUrls: {
        '24x24': string;
      };
    };
    created: string;
    updated: string;
    description?: string;
    issuetype: {
      name: string;
      iconUrl: string;
    };
    project: {
      key: string;
      name: string;
    };
    // Champs personnalisés identifiés depuis Jira
    customfield_10001?: string; // Action clôturée - non disponible
    customfield_10002?: string; // Action corrective - non disponible
    customfield_10003?: string; // Action curative - non disponible
    customfield_10004?: string; // Date de constatation - non disponible
    customfield_10005?: string; // Date effective de réalisation - non disponible
    customfield_10006?: string; // Efficacité de l'action - non disponible
    customfield_10007?: string; // Entité Origine (Campus)
    customfield_10008?: string; // Processus
    // Nouveaux champs personnalisés identifiés
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
}

interface DashboardState {
  issues: JiraIssue[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: string;
  priorityFilter: string;
  assigneeFilter: string;
  actionClotureeFilter: string;
  efficaciteFilter: string;
  entiteOrigineFilter: string;
  processusFilter: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  expandedIssues: Set<string>;
  selectedIssue: JiraIssue | null;
  showSummaryModal: boolean;
  selectedEfficiencyIssue: JiraIssue | null;
  showEfficiencyModal: boolean;
  currentPage: number;
  itemsPerPage: number;
}

export default function DashboardPage() {
  const [state, setState] = useState<DashboardState>({
    issues: [],
    loading: true,
    error: null,
    searchTerm: '',
    statusFilter: 'all',
    priorityFilter: 'all',
    assigneeFilter: 'all',
    actionClotureeFilter: 'all',
    efficaciteFilter: 'all',
    entiteOrigineFilter: 'all',
    processusFilter: 'all',
    sortField: 'created',
    sortDirection: 'desc',
    expandedIssues: new Set(),
    selectedIssue: null,
    showSummaryModal: false,
    selectedEfficiencyIssue: null,
    showEfficiencyModal: false,
    currentPage: 1,
    itemsPerPage: 10
  });

  // Récupérer les issues au chargement
  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Utiliser l'API PowerBI avec mapping vers format Jira
      const response = await fetch('/api/powerbi/issues?maxResults=100');
      const data = await response.json();

      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          issues: data.issues || [], 
          loading: false 
        }));
        console.log('📊 Issues DYS récupérés:', data.issues?.length || 0);
        console.log('🔍 Source des données:', data.source);
        console.log('📋 Champs personnalisés utilisés:', data.usedCustomFields);
        console.log('📊 Champs personnalisés disponibles:', data.customFieldsAvailable);
      } else {
        setState(prev => ({ 
          ...prev, 
          error: data.error || 'Erreur lors de la récupération des issues Jira',
          loading: false 
        }));
      }
    } catch (err) {
      setState(prev => ({ 
        ...prev, 
        error: 'Erreur de connexion Jira',
        loading: false 
      }));
      console.error('❌ Erreur fetch Jira:', err);
    }
  };

  // Fonctions de filtrage et tri
  const getFilteredAndSortedIssues = () => {
    let filtered = state.issues.filter(issue => {
      const matchesSearch = issue.fields.summary.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                          issue.key.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                          (issue.fields.description && issue.fields.description.toLowerCase().includes(state.searchTerm.toLowerCase()));
      const matchesStatus = state.statusFilter === 'all' || issue.fields.status?.name === state.statusFilter;
      const matchesPriority = state.priorityFilter === 'all' || issue.fields.priority?.name?.toLowerCase() === state.priorityFilter.toLowerCase();
      const matchesAssignee = state.assigneeFilter === 'all' || 
                            (issue.fields.assignee?.displayName === state.assigneeFilter);
      const matchesActionCloturee = state.actionClotureeFilter === 'all' || 
                                  issue.fields.customfield_10001 === state.actionClotureeFilter;
      const matchesEfficacite = state.efficaciteFilter === 'all' || 
                               issue.fields.customfield_10006 === state.efficaciteFilter;
      const matchesEntiteOrigine = state.entiteOrigineFilter === 'all' || 
                                 issue.fields.customfield_10007 === state.entiteOrigineFilter;
      const matchesProcessus = state.processusFilter === 'all' || 
                              issue.fields.customfield_10008 === state.processusFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee && 
             matchesActionCloturee && matchesEfficacite && matchesEntiteOrigine && matchesProcessus;
    });

    // Tri
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (state.sortField) {
        case 'key':
          aValue = a.key;
          bValue = b.key;
          break;
        case 'summary':
          aValue = a.fields.summary;
          bValue = b.fields.summary;
          break;
        case 'status':
          aValue = a.fields.status?.name;
          bValue = b.fields.status?.name;
          break;
        case 'priority':
          aValue = a.fields.priority?.name;
          bValue = b.fields.priority?.name;
          break;
        case 'assignee':
          aValue = a.fields.assignee?.displayName || '';
          bValue = b.fields.assignee?.displayName || '';
          break;
        case 'created':
          aValue = new Date(a.fields.created);
          bValue = new Date(b.fields.created);
          break;
        case 'updated':
          aValue = new Date(a.fields.updated);
          bValue = new Date(b.fields.updated);
          break;
        case 'description':
          aValue = a.fields.description || '';
          bValue = b.fields.description || '';
          break;
        case 'customfield_10001':
          aValue = a.fields.customfield_10001 || '';
          bValue = b.fields.customfield_10001 || '';
          break;
        case 'customfield_10002':
          aValue = a.fields.customfield_10002 || '';
          bValue = b.fields.customfield_10002 || '';
          break;
        case 'customfield_10003':
          aValue = a.fields.customfield_10003 || '';
          bValue = b.fields.customfield_10003 || '';
          break;
        case 'customfield_10004':
          aValue = a.fields.customfield_10004 ? new Date(a.fields.customfield_10004) : new Date(0);
          bValue = b.fields.customfield_10004 ? new Date(b.fields.customfield_10004) : new Date(0);
          break;
        case 'customfield_10005':
          aValue = a.fields.customfield_10005 ? new Date(a.fields.customfield_10005) : new Date(0);
          bValue = b.fields.customfield_10005 ? new Date(b.fields.customfield_10005) : new Date(0);
          break;
        case 'customfield_10006':
          aValue = a.fields.customfield_10006 || '';
          bValue = b.fields.customfield_10006 || '';
          break;
        case 'customfield_10007':
          aValue = a.fields.customfield_10007 || '';
          bValue = b.fields.customfield_10007 || '';
          break;
        case 'customfield_10008':
          aValue = a.fields.customfield_10008 || '';
          bValue = b.fields.customfield_10008 || '';
          break;
        case 'customfield_10117':
          aValue = a.fields.customfield_10117 || '';
          bValue = b.fields.customfield_10117 || '';
          break;
        case 'customfield_10118':
          aValue = a.fields.customfield_10118 || '';
          bValue = b.fields.customfield_10118 || '';
          break;
        case 'customfield_10121':
          aValue = a.fields.customfield_10121 || '';
          bValue = b.fields.customfield_10121 || '';
          break;
        case 'customfield_10120':
          aValue = a.fields.customfield_10120 ? new Date(a.fields.customfield_10120) : new Date(0);
          bValue = b.fields.customfield_10120 ? new Date(b.fields.customfield_10120) : new Date(0);
          break;
        default:
          return 0;
      }

      if (state.sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Fonctions de pagination
  const getPaginatedIssues = () => {
    const filtered = getFilteredAndSortedIssues();
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    const filtered = getFilteredAndSortedIssues();
    return Math.ceil(filtered.length / state.itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setState(prev => ({ 
      ...prev, 
      itemsPerPage, 
      currentPage: 1 // Reset to first page when changing items per page
    }));
  };

  const handleSort = (field: string) => {
    setState(prev => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };

  const toggleExpanded = (issueKey: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedIssues);
      if (newExpanded.has(issueKey)) {
        newExpanded.delete(issueKey);
      } else {
        newExpanded.add(issueKey);
      }
      return { ...prev, expandedIssues: newExpanded };
    });
  };

  const openSummaryModal = (issue: JiraIssue) => {
    setState(prev => ({
      ...prev,
      selectedIssue: issue,
      showSummaryModal: true
    }));
  };

  const closeSummaryModal = () => {
    setState(prev => ({
      ...prev,
      selectedIssue: null,
      showSummaryModal: false
    }));
  };

  const openEfficiencyModal = (issue: JiraIssue) => {
    setState(prev => ({
      ...prev,
      selectedEfficiencyIssue: issue,
      showEfficiencyModal: true
    }));
  };

  const closeEfficiencyModal = () => {
    setState(prev => ({
      ...prev,
      selectedEfficiencyIssue: null,
      showEfficiencyModal: false
    }));
  };

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

  const getUniqueValues = (field: string) => {
    const values = new Set();
    state.issues.forEach(issue => {
      let value;
      switch (field) {
        case 'status':
          value = issue.fields.status?.name;
          break;
        case 'priority':
          value = issue.fields.priority?.name;
          break;
        case 'assignee':
          value = issue.fields.assignee?.displayName || 'Non assigné';
          break;
        case 'actionCloturee':
          value = issue.fields.customfield_10001 || 'Non défini';
          break;
        case 'efficacite':
          value = issue.fields.customfield_10006 || 'Non défini';
          break;
        case 'entiteOrigine':
          value = issue.fields.customfield_10007 || 'Non défini';
          break;
        case 'processus':
          value = issue.fields.customfield_10008 || 'Non défini';
          break;
        default:
          return;
      }
      if (value) values.add(value);
    });
    return Array.from(values).sort();
  };

  const filteredIssues = getPaginatedIssues();
  const totalFilteredIssues = getFilteredAndSortedIssues();
  const totalPages = getTotalPages();

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des issues DYS...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">{state.error}</p>
          <Button onClick={fetchIssues} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Dashboard DYS - PowerBI
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">Gestion des issues du projet Ticketing Qualité (Source: PowerBI API)</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button 
                onClick={fetchIssues} 
                variant="outline" 
                size="sm"
                className="bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <div className="text-xs sm:text-sm text-gray-500 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200">
                {filteredIssues.length} issues sur {totalFilteredIssues.length} (page {state.currentPage}/{totalPages})
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 mb-6 border border-gray-200/50">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Filtres et recherche</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher dans les résumés..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
              />
            </div>

            {/* Filtre statut */}
            <div>
              <Select value={state.statusFilter} onValueChange={(value) => setState(prev => ({ ...prev, statusFilter: value }))}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Tous les statuts</SelectItem>
                  {getUniqueValues('status').map((status) => (
                    <SelectItem key={status as string} value={status as string} className="text-gray-900 hover:bg-blue-50">{status as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre priorité */}
            <div>
              <Select value={state.priorityFilter} onValueChange={(value) => setState(prev => ({ ...prev, priorityFilter: value }))}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200">
                  <SelectValue placeholder="Toutes les priorités" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Toutes les priorités</SelectItem>
                  {getUniqueValues('priority').map((priority) => (
                    <SelectItem key={priority as string} value={priority as string} className="text-gray-900 hover:bg-blue-50">{priority as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre assigné */}
            <div>
              <Select value={state.assigneeFilter} onValueChange={(value) => setState(prev => ({ ...prev, assigneeFilter: value }))}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200">
                  <SelectValue placeholder="Tous les assignés" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Tous les assignés</SelectItem>
                  {getUniqueValues('assignee').map((assignee) => (
                    <SelectItem key={assignee as string} value={assignee as string} className="text-gray-900 hover:bg-blue-50">{assignee as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Nombre d'éléments par page */}
            <div>
              <Select value={state.itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200">
                  <SelectValue placeholder="Éléments par page" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="5" className="text-gray-900 hover:bg-blue-50">5 par page</SelectItem>
                  <SelectItem value="10" className="text-gray-900 hover:bg-blue-50">10 par page</SelectItem>
                  <SelectItem value="20" className="text-gray-900 hover:bg-blue-50">20 par page</SelectItem>
                  <SelectItem value="50" className="text-gray-900 hover:bg-blue-50">50 par page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtre Action clôturée */}
            <div>
              <Select value={state.actionClotureeFilter} onValueChange={(value) => setState(prev => ({ ...prev, actionClotureeFilter: value }))}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200">
                  <SelectValue placeholder="Action clôturée" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Toutes les actions</SelectItem>
                  {getUniqueValues('actionCloturee').map((value) => (
                    <SelectItem key={value as string} value={value as string} className="text-gray-900 hover:bg-blue-50">{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre Efficacité */}
            <div>
              <Select value={state.efficaciteFilter} onValueChange={(value) => setState(prev => ({ ...prev, efficaciteFilter: value }))}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200">
                  <SelectValue placeholder="Efficacité" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Toutes les efficacités</SelectItem>
                  {getUniqueValues('efficacite').map((value) => (
                    <SelectItem key={value as string} value={value as string} className="text-gray-900 hover:bg-blue-50">{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre Entité Origine */}
            <div>
              <Select value={state.entiteOrigineFilter} onValueChange={(value) => setState(prev => ({ ...prev, entiteOrigineFilter: value }))}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200">
                  <SelectValue placeholder="Entité Origine" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Toutes les entités</SelectItem>
                  {getUniqueValues('entiteOrigine').map((value) => (
                    <SelectItem key={value as string} value={value as string} className="text-gray-900 hover:bg-blue-50">{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre Processus */}
            <div>
              <Select value={state.processusFilter} onValueChange={(value) => setState(prev => ({ ...prev, processusFilter: value }))}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-200">
                  <SelectValue placeholder="Processus" />
                </SelectTrigger>
                <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Tous les processus</SelectItem>
                  {getUniqueValues('processus').map((value) => (
                    <SelectItem key={value as string} value={value as string} className="text-gray-900 hover:bg-blue-50">{value as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bouton réinitialiser */}
            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  searchTerm: '', 
                  statusFilter: 'all', 
                  priorityFilter: 'all', 
                  assigneeFilter: 'all',
                  actionClotureeFilter: 'all',
                  efficaciteFilter: 'all',
                  entiteOrigineFilter: 'all',
                  processusFilter: 'all',
                  currentPage: 1
                }))}
                className="w-full border-gray-300 hover:bg-gray-50 bg-white/80 backdrop-blur-sm transition-all duration-200 hover:shadow-md"
              >
                <Filter className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>

        {/* Table des issues */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-gray-200/50">
          <div className="max-h-[600px] overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-20 bg-gradient-to-r from-gray-50 to-blue-50 shadow-lg border-b-2 border-gray-300">
                <TableRow className="border-b-0">
                  <TableHead className="w-12 px-4 py-3"></TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[120px]"
                    onClick={() => handleSort('key')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Clé</span>
                      {state.sortField === 'key' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[400px]"
                    onClick={() => handleSort('summary')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Résumé</span>
                      {state.sortField === 'summary' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[120px]"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Statut</span>
                      {state.sortField === 'status' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[120px]"
                    onClick={() => handleSort('priority')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Priorité</span>
                      {state.sortField === 'priority' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[150px]"
                    onClick={() => handleSort('assignee')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Assigné à</span>
                      {state.sortField === 'assignee' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[120px]"
                    onClick={() => handleSort('created')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Créé</span>
                      {state.sortField === 'created' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[200px]"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Description</span>
                      {state.sortField === 'description' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="w-12 px-4 py-3 font-semibold text-gray-700">Actions</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[120px]"
                    onClick={() => handleSort('customfield_10001')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Action clôturée</span>
                      {state.sortField === 'customfield_10001' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[150px]"
                    onClick={() => handleSort('customfield_10002')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Action corrective</span>
                      {state.sortField === 'customfield_10002' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[150px]"
                    onClick={() => handleSort('customfield_10003')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Action curative</span>
                      {state.sortField === 'customfield_10003' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[120px]"
                    onClick={() => handleSort('customfield_10004')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Date constatation</span>
                      {state.sortField === 'customfield_10004' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[150px]"
                    onClick={() => handleSort('customfield_10005')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Date réalisation</span>
                      {state.sortField === 'customfield_10005' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 w-[120px]"
                    onClick={() => handleSort('customfield_10006')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Efficacité</span>
                      {state.sortField === 'customfield_10006' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[120px]"
                    onClick={() => handleSort('customfield_10007')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Entité Origine</span>
                      {state.sortField === 'customfield_10007' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[120px]"
                    onClick={() => handleSort('customfield_10008')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Processus</span>
                      {state.sortField === 'customfield_10008' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[120px]"
                    onClick={() => handleSort('customfield_10117')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Campus</span>
                      {state.sortField === 'customfield_10117' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[120px]"
                    onClick={() => handleSort('customfield_10118')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Processus PR7</span>
                      {state.sortField === 'customfield_10118' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[120px]"
                    onClick={() => handleSort('customfield_10121')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Type Utilisateur</span>
                      {state.sortField === 'customfield_10121' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[120px]"
                    onClick={() => handleSort('customfield_10120')}
                  >
                    <div className="flex items-center gap-2 font-semibold text-gray-700">
                      <span>Date Constatation</span>
                      {state.sortField === 'customfield_10120' && (
                        state.sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <React.Fragment key={issue.id}>
                  <TableRow className="hover:bg-blue-50/50 border-b border-gray-100 transition-colors duration-200 h-16">
                    <TableCell className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(issue.key)}
                        className="p-2 hover:bg-blue-100 border border-gray-200 hover:border-blue-300 transition-all duration-200 rounded-lg"
                        title={state.expandedIssues.has(issue.key) ? "Réduire les détails" : "Voir les détails"}
                      >
                        {state.expandedIssues.has(issue.key) ? (
                          <ChevronUp className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-blue-600 font-medium">
                          {issue.key}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 hover:bg-blue-100"
                          onClick={() => window.open(`https://groupe-espi.atlassian.net/browse/${issue.key}`, '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="min-w-[400px] max-w-[500px]">
                        <button
                          onClick={() => openSummaryModal(issue)}
                          className="font-medium text-gray-900 hover:text-blue-600 hover:underline text-left transition-colors text-sm leading-relaxed block w-full"
                          title={issue.fields.summary}
                        >
                          <div className="line-clamp-2">
                            {issue.fields.summary}
                          </div>
                        </button>
                        {issue.fields.description && (
                          <div className="mt-2">
                            <button
                              onClick={() => openSummaryModal(issue)}
                              className="text-xs text-gray-600 hover:text-blue-600 hover:underline text-left transition-colors block w-full flex items-center gap-1"
                              title="Voir la description complète"
                            >
                              <Info className="w-3 h-3" />
                              <div className="line-clamp-2">
                                {typeof issue.fields.description === 'string' 
                                  ? issue.fields.description.replace(/<[^>]*>/g, '').substring(0, 80) + '...'
                                  : 'Description non disponible'
                                }
                              </div>
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{issue.fields.issuetype?.name || 'Non défini'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge className={`${getStatusColor(issue.fields.status?.name || 'Inconnu')} text-xs px-3 py-1 w-full justify-center`}>
                        {issue.fields.status?.name || 'Inconnu'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge className={`${getPriorityColor(issue.fields.priority?.name || 'Normal')} text-xs px-3 py-1 w-full justify-center`}>
                        {issue.fields.priority?.name || 'Normal'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {issue.fields.assignee ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={issue.fields.assignee?.avatarUrls?.['24x24'] || '/default-avatar.png'}
                            alt={issue.fields.assignee?.displayName || 'Utilisateur'}
                            className="w-6 h-6 rounded-full border border-gray-200"
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                              {issue.fields.assignee?.displayName || 'Utilisateur'}
                            </span>
                            <span className="text-xs text-gray-500">Assigné</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-gray-500">Non assigné</span>
                            <span className="text-xs text-gray-400">En attente</span>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <DateDisplay 
                        date={issue.fields.created} 
                        format="date"
                        className="text-sm text-gray-600"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="min-w-[200px] max-w-[300px]">
                        {issue.fields.description ? (
                          <button
                            onClick={() => openSummaryModal(issue)}
                            className="text-sm text-gray-700 hover:text-blue-600 hover:underline text-left transition-colors block w-full"
                            title="Voir la description complète"
                          >
                            <div className="line-clamp-3 flex items-start gap-1">
                              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{typeof issue.fields.description === 'string' 
                                ? issue.fields.description.replace(/<[^>]*>/g, '').substring(0, 120) + '...'
                                : 'Description non disponible'
                              }</span>
                            </div>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-sm text-gray-500 italic">
                            <AlertCircle className="w-3 h-3" />
                            <span>Aucune description</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Button variant="ghost" size="sm" className="hover:bg-gray-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge className={`${issue.fields.customfield_10001 === 'Oui' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} text-xs px-3 py-1 w-full justify-center`}>
                        {issue.fields.customfield_10001 || 'Non défini'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="max-w-[200px]">
                        <span className="text-sm text-gray-700 line-clamp-2">
                          {issue.fields.customfield_10002 || 'Non défini'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="max-w-[200px]">
                        <span className="text-sm text-gray-700 line-clamp-2">
                          {issue.fields.customfield_10003 || 'Non défini'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {issue.fields.customfield_10004 ? (
                          <DateDisplay 
                            date={issue.fields.customfield_10004} 
                            format="date"
                            className="text-sm text-gray-600"
                          />
                        ) : (
                          'Non défini'
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {issue.fields.customfield_10005 ? (
                          <DateDisplay 
                            date={issue.fields.customfield_10005} 
                            format="date"
                            className="text-sm text-gray-600"
                          />
                        ) : (
                          'Non défini'
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <button
                        onClick={() => openEfficiencyModal(issue)}
                        className="w-full text-left hover:bg-blue-50 rounded-lg p-2 transition-colors duration-200"
                        title="Voir les détails de l'efficacité"
                      >
                        <Badge className={`${issue.fields.customfield_10006 === 'EFFICACE' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'} text-xs px-3 py-1 w-full justify-center max-w-[120px] truncate`}>
                          <span className="truncate">
                            {issue.fields.customfield_10006 || 'Non défini'}
                          </span>
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {issue.fields.customfield_10007 || 'Non défini'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {issue.fields.customfield_10008 || 'Non défini'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {issue.fields.customfield_10117 || 'Non défini'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {issue.fields.customfield_10118 || 'Non défini'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {issue.fields.customfield_10121 || 'Non défini'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {issue.fields.customfield_10120 ? (
                          <DateDisplay 
                            date={issue.fields.customfield_10120} 
                            format="date"
                            className="text-sm text-gray-600"
                          />
                        ) : (
                          'Non défini'
                        )}
                      </span>
                    </TableCell>
                  </TableRow>
                  
                  {/* Ligne détaillée */}
                  {state.expandedIssues.has(issue.key) && (
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={21}>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4 text-blue-600" />
                                Description
                              </h4>
                              <div className="text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded border border-blue-200 shadow-sm">
                                {issue.fields.description ? (
                                  <div className="prose prose-sm max-w-none">
                                    <div dangerouslySetInnerHTML={{ __html: issue.fields.description }} />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-gray-500 italic">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>Aucune description</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-1">Reporter</h4>
                                <div className="flex items-center gap-2">
                                  <img
                                    src={issue.fields.reporter?.avatarUrls?.['24x24'] || '/default-avatar.png'}
                                    alt={issue.fields.reporter?.displayName || 'Utilisateur'}
                                    className="w-6 h-6 rounded-full"
                                  />
                                  <span className="text-sm">{issue.fields.reporter?.displayName || 'Utilisateur'}</span>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800 mb-1">Dates</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>Créé: <DateDisplay date={issue.fields.created} format="datetime" /></span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Modifié: <DateDisplay date={issue.fields.updated} format="datetime" /></span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Champs personnalisés */}
                          <div className="mt-6">
                            <h4 className="font-semibold text-gray-800 mb-3">Informations Qualité</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Action clôturée</h5>
                                <Badge className={`${issue.fields.customfield_10001 === 'Oui' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} text-xs`}>
                                  {issue.fields.customfield_10001 || 'Non défini'}
                                </Badge>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Action corrective</h5>
                                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                  {issue.fields.customfield_10002 || 'Non défini'}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Action curative</h5>
                                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                  {issue.fields.customfield_10003 || 'Non défini'}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Date de constatation</h5>
                                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                  {issue.fields.customfield_10004 ? (
                                    <DateDisplay date={issue.fields.customfield_10004} format="date" />
                                  ) : (
                                    'Non défini'
                                  )}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Date effective de réalisation</h5>
                                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                  {issue.fields.customfield_10005 ? (
                                    <DateDisplay date={issue.fields.customfield_10005} format="date" />
                                  ) : (
                                    'Non défini'
                                  )}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Efficacité de l'action</h5>
                                <Badge className={`${issue.fields.customfield_10006 === 'EFFICACE' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'} text-xs`}>
                                  {issue.fields.customfield_10006 || 'Non défini'}
                                </Badge>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Entité Origine</h5>
                                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                  {issue.fields.customfield_10007 || 'Non défini'}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Processus</h5>
                                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                  {issue.fields.customfield_10008 || 'Non défini'}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Campus</h5>
                                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                  {issue.fields.customfield_10117 || 'Non défini'}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Processus PR7</h5>
                                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                  {issue.fields.customfield_10118 || 'Non défini'}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Type d'utilisateur</h5>
                                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                  {issue.fields.customfield_10121 || 'Non défini'}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Date de constatation</h5>
                                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                  {issue.fields.customfield_10120 ? (
                                    <DateDisplay date={issue.fields.customfield_10120} format="date" />
                                  ) : (
                                    'Non défini'
                                  )}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Description du problème</h5>
                                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                  {issue.fields.customfield_10116 || 'Non défini'}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-600 mb-1">Action curative</h5>
                                <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">
                                  {issue.fields.customfield_10122 || 'Non défini'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        {totalFilteredIssues.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200">
                Affichage de {((state.currentPage - 1) * state.itemsPerPage) + 1} à {Math.min(state.currentPage * state.itemsPerPage, totalFilteredIssues.length)} sur {totalFilteredIssues.length} issues
              </div>
              
              <div className="flex items-center gap-2">
                {/* Bouton précédent */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(state.currentPage - 1)}
                  disabled={state.currentPage === 1}
                  className="flex items-center gap-1 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50"
                >
                  <ChevronDown className="w-4 h-4 rotate-90" />
                  Précédent
                </Button>
                
                {/* Numéros de page */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNumber = Math.max(1, Math.min(totalPages - 4, state.currentPage - 2)) + i;
                    if (pageNumber > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={state.currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        className={`w-8 h-8 p-0 transition-all duration-200 ${
                          state.currentPage === pageNumber 
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                            : "bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                {/* Bouton suivant */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(state.currentPage + 1)}
                  disabled={state.currentPage === totalPages}
                  className="flex items-center gap-1 bg-white/80 backdrop-blur-sm border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 disabled:opacity-50"
                >
                  Suivant
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Message si aucun issue */}
        {filteredIssues.length === 0 && totalFilteredIssues.length === 0 && (
          <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50">
            <div className="p-4 bg-blue-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun issue trouvé</h3>
            <p className="text-gray-600 mb-4">Essayez de modifier vos filtres de recherche</p>
            <Button 
              onClick={() => setState(prev => ({ 
                ...prev, 
                searchTerm: '', 
                statusFilter: 'all', 
                priorityFilter: 'all', 
                assigneeFilter: 'all',
                processusFilter: 'all',
                currentPage: 1
              }))}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>

      {/* Modal pour le résumé */}
      <SummaryModal
        isOpen={state.showSummaryModal}
        onClose={closeSummaryModal}
        issue={state.selectedIssue}
      />

      {/* Modal pour l'efficacité */}
      <EfficiencyModal
        isOpen={state.showEfficiencyModal}
        onClose={closeEfficiencyModal}
        issue={state.selectedEfficiencyIssue}
      />
    </div>
  );
}