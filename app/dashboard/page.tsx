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
    // Champs personnalisés identifiés depuis PowerBI
    customfield_10001?: string; // Action clôturée
    customfield_10002?: string; // Action corrective
    customfield_10003?: string; // Action curative
    customfield_10004?: string; // Date de constatation
    customfield_10005?: string; // Date effective de réalisation
    customfield_10006?: string; // Efficacité de l'action
    customfield_10007?: string; // Entité Origine
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
  sortField: string;
  sortDirection: 'asc' | 'desc';
  expandedIssues: Set<string>;
  selectedIssue: JiraIssue | null;
  showSummaryModal: boolean;
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
    sortField: 'created',
    sortDirection: 'desc',
    expandedIssues: new Set(),
    selectedIssue: null,
    showSummaryModal: false
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
                          issue.key.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesStatus = state.statusFilter === 'all' || issue.fields.status?.name === state.statusFilter;
      const matchesPriority = state.priorityFilter === 'all' || issue.fields.priority?.name?.toLowerCase() === state.priorityFilter.toLowerCase();
      const matchesAssignee = state.assigneeFilter === 'all' || 
                            (issue.fields.assignee?.displayName === state.assigneeFilter);

      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
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
        default:
          return;
      }
      values.add(value);
    });
    return Array.from(values).sort();
  };

  const filteredIssues = getFilteredAndSortedIssues();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
               <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                 Dashboard DYS - PowerBI
               </h1>
               <p className="text-gray-600 mt-2">Gestion des issues du projet Ticketing Qualité (Source: PowerBI API)</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={fetchIssues} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
              <div className="text-sm text-gray-500">
                {filteredIssues.length} issues sur {state.issues.length}
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">Filtres et recherche</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher dans les résumés..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Filtre statut */}
            <div>
              <Select value={state.statusFilter} onValueChange={(value) => setState(prev => ({ ...prev, statusFilter: value }))}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  {getUniqueValues('status').map((status) => (
                    <SelectItem key={status as string} value={status as string}>{status as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre priorité */}
            <div>
              <Select value={state.priorityFilter} onValueChange={(value) => setState(prev => ({ ...prev, priorityFilter: value }))}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Toutes les priorités" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">Toutes les priorités</SelectItem>
                  {getUniqueValues('priority').map((priority) => (
                    <SelectItem key={priority as string} value={priority as string}>{priority as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre assigné */}
            <div>
              <Select value={state.assigneeFilter} onValueChange={(value) => setState(prev => ({ ...prev, assigneeFilter: value }))}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Tous les assignés" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">Tous les assignés</SelectItem>
                  {getUniqueValues('assignee').map((assignee) => (
                    <SelectItem key={assignee as string} value={assignee as string}>{assignee as string}</SelectItem>
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
                  assigneeFilter: 'all' 
                }))}
                className="w-full border-gray-300 hover:bg-gray-50"
              >
                <Filter className="w-4 h-4 mr-2" />
                Réinitialiser
              </Button>
            </div>
          </div>
        </div>

        {/* Table des issues */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
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
                    className="cursor-pointer hover:bg-gray-100 select-none px-4 py-3 min-w-[120px]"
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
                </TableRow>
              </TableHeader>
            <TableBody>
              {filteredIssues.map((issue) => (
                <React.Fragment key={issue.id}>
                  <TableRow className="hover:bg-gray-50 border-b border-gray-100">
                    <TableCell className="px-4 py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(issue.key)}
                        className="p-1 hover:bg-gray-200"
                      >
                        {state.expandedIssues.has(issue.key) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
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
                                {issue.fields.description.replace(/<[^>]*>/g, '').substring(0, 80)}...
                              </div>
                            </button>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1">{issue.fields.issuetype?.name || 'Non défini'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge className={`${getStatusColor(issue.fields.status?.name || 'Inconnu')} text-xs`}>
                        {issue.fields.status?.name || 'Inconnu'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge className={`${getPriorityColor(issue.fields.priority?.name || 'Normal')} text-xs`}>
                        {issue.fields.priority?.name || 'Normal'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {issue.fields.assignee ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={issue.fields.assignee?.avatarUrls?.['24x24'] || '/default-avatar.png'}
                            alt={issue.fields.assignee?.displayName || 'Utilisateur'}
                            className="w-6 h-6 rounded-full"
                          />
                          <span className="text-sm truncate max-w-[120px]">{issue.fields.assignee?.displayName || 'Utilisateur'}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Non assigné</span>
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
                              <span>{issue.fields.description.replace(/<[^>]*>/g, '').substring(0, 120)}...</span>
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
                      <Badge className={`${issue.fields.customfield_10001 === 'Oui' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'} text-xs`}>
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
                      <Badge className={`${issue.fields.customfield_10006 === 'EFFICACE' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'} text-xs`}>
                        {issue.fields.customfield_10006 || 'Non défini'}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="text-sm text-gray-700">
                        {issue.fields.customfield_10007 || 'Non défini'}
                      </span>
                    </TableCell>
                  </TableRow>
                  
                  {/* Ligne détaillée */}
                  {state.expandedIssues.has(issue.key) && (
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={15}>
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

        {/* Message si aucun issue */}
        {filteredIssues.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Aucun issue trouvé</p>
            <p className="text-gray-500">Essayez de modifier vos filtres de recherche</p>
          </div>
        )}
      </div>

      {/* Modal pour le résumé */}
      <SummaryModal
        isOpen={state.showSummaryModal}
        onClose={closeSummaryModal}
        issue={state.selectedIssue}
      />
    </div>
  );
}