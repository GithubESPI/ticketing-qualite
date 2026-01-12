'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  Info,
  BarChart3,
  ArrowUpDown,
  LayoutGrid,
  List
} from 'lucide-react';
import AuthHeader from '@/components/AuthHeader';
import AuthGuard from '@/components/AuthGuard';
import DateDisplay from '../components/DateDisplay';
import SummaryModal from '../components/SummaryModal';
import EfficiencyModal from '../components/EfficiencyModal';
import ActionsModal from '../components/ActionsModal';
import ActionCurativeModal from '../components/ActionCurativeModal';
import ActionCorrectiveModal from '../components/ActionCorrectiveModal';

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
    customfield_10001?: string; // Action clôturée
    customfield_10002?: string; // Action corrective
    customfield_10003?: string; // Action curative
    customfield_10004?: string; // Date de constatation
    customfield_10005?: string; // Date effective de réalisation
    customfield_10006?: string; // Efficacité de l'action
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
  selectedActionIssue: JiraIssue | null;
  showActionsModal: boolean;
  selectedActionCurativeIssue: JiraIssue | null;
  showActionCurativeModal: boolean;
  selectedActionCorrectiveIssue: JiraIssue | null;
  showActionCorrectiveModal: boolean;
  currentPage: number;
  itemsPerPage: number;
}

export default function DashboardPage() {
  const router = useRouter();
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
    selectedActionIssue: null,
    showActionsModal: false,
    selectedActionCurativeIssue: null,
    showActionCurativeModal: false,
    selectedActionCorrectiveIssue: null,
    showActionCorrectiveModal: false,
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

  // Optimisation: Filtrage et Tri avec useMemo
  const totalFilteredIssues = useMemo(() => {
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
  }, [state.issues, state.searchTerm, state.statusFilter, state.priorityFilter, state.assigneeFilter, state.actionClotureeFilter, state.efficaciteFilter, state.entiteOrigineFilter, state.processusFilter, state.sortField, state.sortDirection]);

  // Pagination avec useMemo
  const filteredIssues = useMemo(() => {
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    return totalFilteredIssues.slice(startIndex, endIndex);
  }, [totalFilteredIssues, state.currentPage, state.itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(totalFilteredIssues.length / state.itemsPerPage);
  }, [totalFilteredIssues.length, state.itemsPerPage]);

  const handlePageChange = useCallback((page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleItemsPerPageChange = useCallback((itemsPerPage: number) => {
    setState(prev => ({ 
      ...prev, 
      itemsPerPage, 
      currentPage: 1 
    }));
  }, []);

  const handleSort = useCallback((field: string) => {
    setState(prev => ({
      ...prev,
      sortField: field,
      sortDirection: prev.sortField === field && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const toggleExpanded = useCallback((issueKey: string) => {
    setState(prev => {
      const newExpanded = new Set(prev.expandedIssues);
      if (newExpanded.has(issueKey)) {
        newExpanded.delete(issueKey);
      } else {
        newExpanded.add(issueKey);
      }
      return { ...prev, expandedIssues: newExpanded };
    });
  }, []);

  // Gestion des modales
  const openSummaryModal = (issue: JiraIssue) => {
    setState(prev => ({ ...prev, selectedIssue: issue, showSummaryModal: true }));
  };

  const closeSummaryModal = () => {
    setState(prev => ({ ...prev, selectedIssue: null, showSummaryModal: false }));
  };

  const openEfficiencyModal = (issue: JiraIssue) => {
    setState(prev => ({ ...prev, selectedEfficiencyIssue: issue, showEfficiencyModal: true }));
  };

  const closeEfficiencyModal = () => {
    setState(prev => ({ ...prev, selectedEfficiencyIssue: null, showEfficiencyModal: false }));
  };

  const openActionsModal = (issue: JiraIssue) => {
    setState(prev => ({ ...prev, selectedActionIssue: issue, showActionsModal: true }));
  };

  const closeActionsModal = () => {
    setState(prev => ({ ...prev, selectedActionIssue: null, showActionsModal: false }));
  };

  const openActionCurativeModal = (issue: JiraIssue) => {
    setState(prev => ({ ...prev, selectedActionCurativeIssue: issue, showActionCurativeModal: true }));
  };

  const closeActionCurativeModal = () => {
    setState(prev => ({ ...prev, selectedActionCurativeIssue: null, showActionCurativeModal: false }));
  };

  const openActionCorrectiveModal = (issue: JiraIssue) => {
    setState(prev => ({ ...prev, selectedActionCorrectiveIssue: issue, showActionCorrectiveModal: true }));
  };

  const closeActionCorrectiveModal = () => {
    setState(prev => ({ ...prev, selectedActionCorrectiveIssue: null, showActionCorrectiveModal: false }));
  };

  // Helpers couleurs
  const getStatusColor = (status: string) => {
    if (!status) return 'bg-slate-100 text-slate-700 border-slate-200';
    switch (status.toLowerCase()) {
      case 'done': case 'terminé': case 'closed': return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/20';
      case 'in progress': case 'en cours': case 'in review': return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-600/20';
      case 'to do': case 'nouveau': case 'open': return 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-600/20';
      case 'blocked': case 'bloqué': return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/20';
      default: return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    if (!priority) return 'bg-slate-100 text-slate-700 border-slate-200';
    switch (priority.toLowerCase()) {
      case 'highest': case 'haute': case 'critical': return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-600/20 font-medium';
      case 'high': case 'moyenne': return 'bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-600/20';
      case 'medium': case 'normale': return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-600/20';
      case 'low': case 'basse': return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-600/20';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-600/20';
    }
  };

  const getUniqueValues = (field: string) => {
    const values = new Set();
    state.issues.forEach(issue => {
      let value;
      switch (field) {
        case 'status': value = issue.fields.status?.name; break;
        case 'priority': value = issue.fields.priority?.name; break;
        case 'assignee': value = issue.fields.assignee?.displayName || 'Non assigné'; break;
        case 'actionCloturee': value = issue.fields.customfield_10001 || 'Non défini'; break;
        case 'efficacite': value = issue.fields.customfield_10006 || 'Non défini'; break;
        case 'entiteOrigine': value = issue.fields.customfield_10007 || 'Non défini'; break;
        case 'processus': value = issue.fields.customfield_10008 || 'Non défini'; break;
        default: return;
      }
      if (value) values.add(value);
    });
    return Array.from(values).sort();
  };

  return (
    <AuthGuard>
      {state.loading ? (
        <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
          <div className="w-full max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden h-40 flex flex-col justify-center">
               <div className="h-10 bg-slate-200 rounded-lg w-1/3 mb-4"></div>
               <div className="h-5 bg-slate-100 rounded-lg w-1/2"></div>
            </div>

            {/* Filters Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 h-32">
               <div className="h-8 bg-slate-200 rounded-lg w-48 mb-6"></div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-11 bg-slate-100 rounded-lg"></div>
                  ))}
               </div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
              <div className="h-16 bg-slate-50/80 border-b border-slate-200"></div>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-16 border-b border-slate-100 bg-white flex items-center px-4 gap-4">
                   <div className="h-8 w-8 bg-slate-100 rounded-full"></div>
                   <div className="h-6 w-24 bg-slate-100 rounded"></div>
                   <div className="h-6 w-64 bg-slate-100 rounded flex-1"></div>
                   <div className="h-6 w-20 bg-slate-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : state.error ? (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-slate-50 to-rose-50 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-rose-100 max-w-md mx-4">
            <div className="text-rose-500 mb-6 bg-rose-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Erreur de chargement</h3>
            <p className="text-slate-600 mb-6">{state.error}</p>
            <Button onClick={fetchIssues} className="bg-rose-600 hover:bg-rose-700 text-white w-full py-6 rounded-xl shadow-lg shadow-rose-600/20">
              <RefreshCw className="w-5 h-5 mr-2" />
              Réessayer
            </Button>
          </div>
        </div>
      ) : (
      <div className="min-h-screen bg-slate-50/50 pb-20 font-sans">
        <div className="w-full max-w-[1920px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* En-tête avec design moderne */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-60 pointer-events-none transition-opacity duration-700 group-hover:opacity-80"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
                  Dashboard Qualité
                </span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm py-1 px-3">
                  v2.0
                </Badge>
              </h1>
              <p className="text-slate-500 text-base max-w-2xl">
                Suivi et gestion centralisée des tickets Jira, actions correctives et analyses de performance.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button 
                onClick={() => router.push('/analytics')}
                variant="outline" 
                className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-sm transition-all duration-300 hover:shadow-md hover:border-indigo-100 h-11"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              
              <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>
              
              <AuthHeader />
              
              <Button 
                onClick={fetchIssues} 
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:shadow-blue-600/30 h-11"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4 text-sm text-slate-500 border-t border-slate-100 pt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-medium text-slate-700">{totalFilteredIssues.length}</span> tickets trouvés
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <div>
              Dernière mise à jour: <span className="text-slate-700 font-medium">{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Zone de filtres repensée */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 transition-all duration-300 hover:shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Filtres avancés</h3>
              <p className="text-xs text-slate-500">Affinez votre recherche par critères</p>
            </div>
            
            <div className="ml-auto">
              <Button 
                variant="ghost" 
                size="sm"
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
                className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" />
                Réinitialiser tout
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Recherche principale */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-2 relative group">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Rechercher par clé, résumé ou description..."
                value={state.searchTerm}
                onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-slate-50 group-hover:bg-white transition-all duration-200"
              />
            </div>

            {/* Selecteurs stylisés */}
            {[
              { value: state.statusFilter, onChange: (val: string) => setState(prev => ({ ...prev, statusFilter: val })), placeholder: "Tous les statuts", options: getUniqueValues('status'), icon: <List className="w-4 h-4" /> },
              { value: state.priorityFilter, onChange: (val: string) => setState(prev => ({ ...prev, priorityFilter: val })), placeholder: "Toutes les priorités", options: getUniqueValues('priority'), icon: <AlertCircle className="w-4 h-4" /> },
              { value: state.assigneeFilter, onChange: (val: string) => setState(prev => ({ ...prev, assigneeFilter: val })), placeholder: "Tous les assignés", options: getUniqueValues('assignee'), icon: <User className="w-4 h-4" /> },
              { value: state.processusFilter, onChange: (val: string) => setState(prev => ({ ...prev, processusFilter: val })), placeholder: "Tous les processus", options: getUniqueValues('processus'), icon: <LayoutGrid className="w-4 h-4" /> }
            ].map((filter, idx) => (
              <div key={idx}>
                <Select value={filter.value} onValueChange={filter.onChange}>
                  <SelectTrigger className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white text-slate-700 hover:bg-slate-50 transition-all duration-200">
                    <div className="flex items-center gap-2 truncate">
                      {/* <span className="text-slate-400">{filter.icon}</span> */}
                      <SelectValue placeholder={filter.placeholder} />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="all" className="font-medium text-slate-900 bg-slate-50 mb-1">
                      {filter.placeholder}
                    </SelectItem>
                    {filter.options.map((opt: any) => (
                      <SelectItem key={opt} value={opt} className="text-slate-700 focus:bg-blue-50 focus:text-blue-700">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>

        {/* Table des issues améliorée */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col relative transition-all duration-300 hover:shadow-md">
          <div className="overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="bg-slate-50/80 backdrop-blur sticky top-0 z-10">
                <TableRow className="border-b border-slate-200 hover:bg-transparent">
                  <TableHead className="w-12 px-4 py-4"></TableHead>
                  {[
                    { key: 'key', label: 'Clé', width: 'min-w-[100px]' },
                    { key: 'summary', label: 'Résumé', width: 'min-w-[300px]' },
                    { key: 'status', label: 'Statut', width: 'min-w-[140px]' },
                    { key: 'priority', label: 'Priorité', width: 'min-w-[130px]' },
                    { key: 'assignee', label: 'Assigné à', width: 'min-w-[180px]' },
                    { key: 'created', label: 'Créé le', width: 'min-w-[120px]' },
                    { key: 'description', label: 'Description', width: 'min-w-[200px]' },
                  ].map((col) => (
                    <TableHead 
                      key={col.key}
                      className={`cursor-pointer hover:bg-slate-100/50 select-none px-4 py-4 ${col.width} transition-colors group`}
                      onClick={() => handleSort(col.key)}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-700 text-xs uppercase tracking-wider">
                        <span>{col.label}</span>
                        <div className={`flex flex-col transition-opacity duration-200 ${state.sortField === col.key ? 'opacity-100' : 'opacity-30 group-hover:opacity-60'}`}>
                          <ChevronUp className={`w-2.5 h-2.5 ${state.sortField === col.key && state.sortDirection === 'asc' ? 'text-blue-600' : ''}`} />
                          <ChevronDown className={`w-2.5 h-2.5 ${state.sortField === col.key && state.sortDirection === 'desc' ? 'text-blue-600' : ''}`} />
                        </div>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-16 px-4 py-4 font-bold text-slate-700 text-xs uppercase tracking-wider text-center">Actions</TableHead>
                  {[
                    { key: 'customfield_10001', label: 'Action Clôturée', width: 'min-w-[150px]' },
                    { key: 'customfield_10002', label: 'Action Corrective', width: 'min-w-[160px]' },
                    { key: 'customfield_10003', label: 'Action Curative', width: 'min-w-[160px]' },
                    { key: 'customfield_10004', label: 'Date Constat.', width: 'min-w-[150px]' },
                    { key: 'customfield_10006', label: 'Efficacité', width: 'min-w-[140px]' },
                  ].map((col) => (
                    <TableHead 
                      key={col.key}
                      className={`cursor-pointer hover:bg-slate-100/50 select-none px-4 py-4 ${col.width} transition-colors group`}
                      onClick={() => handleSort(col.key)}
                    >
                      <div className="flex items-center gap-2 font-bold text-slate-700 text-xs uppercase tracking-wider">
                        <span>{col.label}</span>
                        {state.sortField === col.key && (
                          state.sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIssues.map((issue) => (
                  <React.Fragment key={issue.id}>
                    <TableRow className={`border-b border-slate-100 transition-all duration-200 group ${state.expandedIssues.has(issue.key) ? 'bg-blue-50/30' : 'hover:bg-slate-50/80'}`}>
                      <TableCell className="px-4 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(issue.key)}
                          className={`w-8 h-8 p-0 rounded-full transition-all duration-200 ${state.expandedIssues.has(issue.key) ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-400'}`}
                        >
                          {state.expandedIssues.has(issue.key) ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </TableCell>
                      
                      <TableCell className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 group-hover:border-blue-200 group-hover:bg-white group-hover:text-blue-700 transition-all shadow-sm">
                            {issue.key}
                          </span>
                          <a
                            href={`https://groupe-espi.atlassian.net/browse/${issue.key}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 transition-all"
                            title="Ouvrir dans Jira"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <div className="max-w-[300px]">
                          <button
                            onClick={() => openSummaryModal(issue)}
                            className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors text-left line-clamp-2 leading-relaxed"
                          >
                            {issue.fields.summary}
                          </button>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 bg-slate-100 text-slate-500 border border-slate-200 font-medium">
                              {issue.fields.issuetype?.name || 'Issue'}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-4 whitespace-nowrap">
                        <Badge className={`${getStatusColor(issue.fields.status?.name || 'Inconnu')} text-xs px-3 py-1 rounded-full shadow-sm border font-semibold`}>
                          {issue.fields.status?.name || 'Inconnu'}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-4 py-4 whitespace-nowrap">
                        <Badge className={`${getPriorityColor(issue.fields.priority?.name || 'Normal')} text-xs px-3 py-1 rounded-full shadow-sm border font-semibold`}>
                          {issue.fields.priority?.name || 'Normal'}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        {issue.fields.assignee ? (
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={issue.fields.assignee?.avatarUrls?.['24x24'] || '/default-avatar.png'}
                                alt=""
                                className="w-8 h-8 rounded-full border border-slate-200 shadow-sm"
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">
                              {issue.fields.assignee?.displayName}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 opacity-60">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 border-dashed">
                              <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <span className="text-sm text-slate-500 italic">Non assigné</span>
                          </div>
                        )}
                      </TableCell>

                      <TableCell className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <DateDisplay 
                            date={issue.fields.created} 
                            format="date"
                            className="text-sm font-medium text-slate-700"
                          />
                          <span className="text-[11px] text-slate-400 mt-0.5">
                            <DateDisplay date={issue.fields.created} format="time" />
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <div className="max-w-[200px] text-sm text-slate-600 truncate">
                          {issue.fields.description ? (
                             <span className="flex items-center gap-1.5 text-slate-500 cursor-help" title={issue.fields.description.replace(/<[^>]*>/g, '').substring(0, 200)}>
                               <Info className="w-3.5 h-3.5" />
                               {issue.fields.description.replace(/<[^>]*>/g, '').substring(0, 30)}...
                             </span>
                          ) : (
                            <span className="text-slate-400 italic text-xs">—</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="px-4 py-4 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="w-8 h-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                          onClick={() => openActionsModal(issue)}
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </Button>
                      </TableCell>

                      <TableCell className="px-4 py-4 whitespace-nowrap">
                         <Badge className={`${issue.fields.customfield_10001 === 'Oui' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'} text-xs px-2.5 py-1 border shadow-sm`}>
                          {issue.fields.customfield_10001 || 'Non'}
                        </Badge>
                      </TableCell>

                      {/* Autres colonnes avec style allégé */}
                      <TableCell className="px-4 py-4 text-sm text-slate-600">
                        {issue.fields.customfield_10002 ? (
                          <div className="flex items-center gap-2 group/link cursor-pointer" onClick={() => openActionCorrectiveModal(issue)}>
                             <span className="truncate max-w-[120px] group-hover/link:text-blue-600 transition-colors">{issue.fields.customfield_10002}</span>
                             <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 text-blue-500" />
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </TableCell>
                      
                      <TableCell className="px-4 py-4 text-sm text-slate-600">
                        {issue.fields.customfield_10003 ? (
                          <div className="flex items-center gap-2 group/link cursor-pointer" onClick={() => openActionCurativeModal(issue)}>
                             <span className="truncate max-w-[120px] group-hover/link:text-blue-600 transition-colors">{issue.fields.customfield_10003}</span>
                             <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 text-blue-500" />
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </TableCell>

                      <TableCell className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">
                         {issue.fields.customfield_10004 ? <DateDisplay date={issue.fields.customfield_10004} format="date" /> : <span className="text-slate-300">—</span>}
                      </TableCell>

                      <TableCell className="px-4 py-4">
                        <Badge className={`${
                            issue.fields.customfield_10006 === 'EFFICACE' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : issue.fields.customfield_10006 
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-400 border-slate-200'
                          } text-xs px-2.5 py-1 border shadow-sm`}>
                            {issue.fields.customfield_10006 || '—'}
                          </Badge>
                      </TableCell>

                    </TableRow>
                    
                    {/* Ligne détaillée - Design amélioré */}
                    {state.expandedIssues.has(issue.key) && (
                      <TableRow className="bg-blue-50/20">
                        <TableCell colSpan={14} className="p-0 border-b border-slate-200">
                          <div className="p-6 sm:p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                              {/* Colonne principale */}
                              <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
                                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                                    <div className="p-1.5 bg-blue-100 rounded-lg">
                                      <Info className="w-4 h-4 text-blue-600" />
                                    </div>
                                    Description détaillée
                                  </h4>
                                  <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed">
                                    {issue.fields.description ? (
                                      <div dangerouslySetInnerHTML={{ __html: issue.fields.description }} />
                                    ) : (
                                      <div className="flex items-center gap-2 text-slate-400 italic py-4">
                                        <AlertCircle className="w-4 h-4" />
                                        Aucune description disponible
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                                    <h4 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Informations Action</h4>
                                    <div className="space-y-3">
                                      {[
                                        { label: 'Action Clôturée', value: issue.fields.customfield_10001 },
                                        { label: 'Efficacité', value: issue.fields.customfield_10006 },
                                        { label: 'Processus', value: issue.fields.customfield_10008 },
                                      ].map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-1">
                                          <span className="text-sm text-slate-500">{item.label}</span>
                                          <span className="text-sm font-medium text-slate-800">{item.value || '—'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                                    <h4 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">Contextualisation</h4>
                                    <div className="space-y-3">
                                      {[
                                        { label: 'Campus', value: issue.fields.customfield_10117 },
                                        { label: 'Type Utilisateur', value: issue.fields.customfield_10121 },
                                        { label: 'Entité Origine', value: issue.fields.customfield_10007 },
                                      ].map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-1">
                                          <span className="text-sm text-slate-500">{item.label}</span>
                                          <span className="text-sm font-medium text-slate-800">{item.value || '—'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Colonne latérale */}
                              <div className="space-y-6">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                  <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Personnes impliquées</h4>
                                  
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                      <div className="relative">
                                         <img
                                          src={issue.fields.reporter?.avatarUrls?.['24x24'] || '/default-avatar.png'}
                                          alt=""
                                          className="w-10 h-10 rounded-full border border-slate-200"
                                        />
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 font-medium">Reporter</p>
                                        <p className="text-sm font-bold text-slate-800">{issue.fields.reporter?.displayName || 'Inconnu'}</p>
                                      </div>
                                    </div>

                                    <div className="h-px bg-slate-100 w-full"></div>

                                    <div className="flex items-center gap-3">
                                      <div className="relative">
                                         <img
                                          src={issue.fields.assignee?.avatarUrls?.['24x24'] || '/default-avatar.png'}
                                          alt=""
                                          className="w-10 h-10 rounded-full border border-slate-200"
                                        />
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 font-medium">Assigné à</p>
                                        <p className="text-sm font-bold text-slate-800">{issue.fields.assignee?.displayName || 'Non assigné'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                  <h4 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Dates clés</h4>
                                  <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 mt-0.5">
                                        <Calendar className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 font-medium">Création</p>
                                        <p className="text-sm font-semibold text-slate-800"><DateDisplay date={issue.fields.created} format="datetime" /></p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3">
                                      <div className="p-2 bg-orange-50 rounded-lg text-orange-600 mt-0.5">
                                        <Clock className="w-4 h-4" />
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500 font-medium">Dernière mise à jour</p>
                                        <p className="text-sm font-semibold text-slate-800"><DateDisplay date={issue.fields.updated} format="datetime" /></p>
                                      </div>
                                    </div>
                                  </div>
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

        {/* Pagination flottante moderne */}
        {totalFilteredIssues.length > 0 && (
          <div className="sticky bottom-6 z-40 mx-auto max-w-fit">
            <div className="bg-white/90 backdrop-blur-md rounded-full shadow-2xl border border-slate-200/60 p-1.5 flex items-center gap-2 animate-in slide-in-from-bottom-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePageChange(state.currentPage - 1)}
                disabled={state.currentPage === 1}
                className="rounded-full w-9 h-9 hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </Button>
              
              <div className="flex items-center px-2 gap-1">
                <span className="text-sm font-medium text-slate-600">Page</span>
                <span className="text-sm font-bold text-slate-900 min-w-[1.5rem] text-center">{state.currentPage}</span>
                <span className="text-sm text-slate-400">/</span>
                <span className="text-sm font-medium text-slate-600">{totalPages}</span>
              </div>

              <div className="h-4 w-px bg-slate-200 mx-1"></div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handlePageChange(state.currentPage + 1)}
                disabled={state.currentPage === totalPages}
                className="rounded-full w-9 h-9 hover:bg-slate-100 disabled:opacity-30"
              >
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </Button>
              
              <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                <Select value={state.itemsPerPage.toString()} onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}>
                  <SelectTrigger className="h-8 border-transparent hover:bg-slate-100 rounded-full px-2 gap-1 text-xs font-medium bg-transparent focus:ring-0 w-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="5">5 / page</SelectItem>
                    <SelectItem value="10">10 / page</SelectItem>
                    <SelectItem value="20">20 / page</SelectItem>
                    <SelectItem value="50">50 / page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Message si aucun issue */}
        {filteredIssues.length === 0 && totalFilteredIssues.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200/60 dashed-border">
            <div className="p-6 bg-slate-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center animate-bounce">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Aucun ticket trouvé</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Nous n'avons trouvé aucun résultat correspondant à vos critères. Essayez de modifier vos filtres.
            </p>
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
              className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-6 rounded-xl shadow-lg shadow-slate-800/20"
            >
              Réinitialiser tous les filtres
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <SummaryModal
        isOpen={state.showSummaryModal}
        onClose={closeSummaryModal}
        issue={state.selectedIssue}
      />

      <EfficiencyModal
        isOpen={state.showEfficiencyModal}
        onClose={closeEfficiencyModal}
        issue={state.selectedEfficiencyIssue}
      />

      <ActionsModal
        isOpen={state.showActionsModal}
        onClose={closeActionsModal}
        issue={state.selectedActionIssue}
      />

      <ActionCurativeModal
        isOpen={state.showActionCurativeModal}
        onClose={closeActionCurativeModal}
        issue={state.selectedActionCurativeIssue}
      />

      <ActionCorrectiveModal
        isOpen={state.showActionCorrectiveModal}
        onClose={closeActionCorrectiveModal}
        issue={state.selectedActionCorrectiveIssue}
      />
      </div>
      )}
    </AuthGuard>
  );
}
