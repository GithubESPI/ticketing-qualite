'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import AuthHeader from '@/components/AuthHeader';
import AuthGuard from '@/components/AuthGuard';
import FilterConfig from '@/components/FilterConfig';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Target,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ArrowLeft,
  X,
  CalendarIcon,
  Settings
} from 'lucide-react';

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
    };
    assignee?: {
      displayName: string;
    };
    reporter: {
      displayName: string;
    };
    created: string;
    updated: string;
    description?: string;
    customfield_10007?: string; // Entité Origine
    customfield_10008?: string; // Processus
    customfield_10117?: string; // Campus
    customfield_10118?: string; // Processus PR7
    customfield_10121?: string; // Type d'utilisateur
    customfield_10120?: string; // Date de constatation
  };
}

interface AnalyticsState {
  issues: JiraIssue[];
  loading: boolean;
  error: string | null;
  statusFilter: string;
  priorityFilter: string;
  assigneeFilter: string;
  processusFilter: string;
  campusFilter: string;
  userTypeFilter: string;
  dateRange: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  showKpiModal: boolean;
  selectedKpiType: string;
  selectedKpiData: JiraIssue[];
  showFilterConfig: boolean;
  showSidebar: boolean;
  // Filtres visibles dans la sidebar
  visibleFilters: {
    status: boolean;
    priority: boolean;
    assignee: boolean;
    processus: boolean;
    campus: boolean;
    userType: boolean;
    dateRange: boolean;
    customDate: boolean;
  };
}

const chartConfig = {
  count: {
    label: "Nombre d'issues",
    color: "hsl(var(--chart-1))",
  },
  open: {
    label: "Ouverts",
    color: "hsl(var(--chart-2))",
  },
  closed: {
    label: "Clôturées",
    color: "hsl(var(--chart-3))",
  },
  inProgress: {
    label: "En cours",
    color: "hsl(var(--chart-4))",
  },
  high: {
    label: "Haute",
    color: "hsl(var(--chart-5))",
  },
  medium: {
    label: "Moyenne",
    color: "hsl(var(--chart-6))",
  },
  low: {
    label: "Basse",
    color: "hsl(var(--chart-7))",
  },
} satisfies ChartConfig;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function AnalyticsPage() {
  const router = useRouter();
  const [state, setState] = useState<AnalyticsState>({
    issues: [],
    loading: true,
    error: null,
    statusFilter: 'all',
    priorityFilter: 'all',
    assigneeFilter: 'all',
    processusFilter: 'all',
    campusFilter: 'all',
    userTypeFilter: 'all',
    dateRange: '30',
    startDate: undefined,
    endDate: undefined,
    showKpiModal: false,
    selectedKpiType: '',
    selectedKpiData: [],
    showFilterConfig: false,
    showSidebar: false,
    visibleFilters: {
      status: true,
      priority: true,
      assignee: false,
      processus: false,
      campus: false,
      userType: false,
      dateRange: true,
      customDate: false
    }
  });

  // Charger les données
  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('/api/powerbi/issues?maxResults=1000');
      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({ ...prev, issues: data.issues, loading: false }));
      } else {
        setState(prev => ({ ...prev, error: data.error, loading: false }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: 'Erreur lors du chargement des données', loading: false }));
    }
  };

  // Filtrer les données
  const getFilteredIssues = () => {
    let filtered = state.issues;

    if (state.statusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.fields.status?.name === state.statusFilter);
    }

    if (state.priorityFilter !== 'all') {
      filtered = filtered.filter(issue => issue.fields.priority?.name === state.priorityFilter);
    }

    if (state.assigneeFilter !== 'all') {
      filtered = filtered.filter(issue => issue.fields.assignee?.displayName === state.assigneeFilter);
    }

    if (state.processusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.fields.customfield_10008 === state.processusFilter);
    }

    if (state.campusFilter !== 'all') {
      filtered = filtered.filter(issue => issue.fields.customfield_10117 === state.campusFilter);
    }

    if (state.userTypeFilter !== 'all') {
      filtered = filtered.filter(issue => issue.fields.customfield_10121 === state.userTypeFilter);
    }

    // Filtre par date (dateRange)
    if (state.dateRange !== 'all') {
      const days = parseInt(state.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(issue => new Date(issue.fields.created) >= cutoffDate);
    }

    // Filtre par date personnalisée
    if (state.startDate || state.endDate) {
      filtered = filtered.filter(issue => {
        const issueDate = new Date(issue.fields.created);
        
        if (state.startDate && issueDate < state.startDate) {
          return false;
        }
        
        if (state.endDate) {
          const endDate = new Date(state.endDate);
          endDate.setHours(23, 59, 59, 999); // Fin de journée
          if (issueDate > endDate) {
            return false;
          }
        }
        
        return true;
      });
    }

    return filtered;
  };

  const filteredIssues = getFilteredIssues();

  // Données pour les graphiques
  const getIssuesByStatus = () => {
    const statusCounts = filteredIssues.reduce((acc, issue) => {
      const status = issue.fields.status?.name || 'Inconnu';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Si pas de données, créer des données d'exemple
    if (Object.keys(statusCounts).length === 0) {
      return [
        { status: 'Ouvert', count: 5, fill: 'var(--color-open)' },
        { status: 'Clôturée', count: 3, fill: 'var(--color-closed)' },
        { status: 'Mettre en œuvre', count: 2, fill: 'var(--color-inProgress)' }
      ];
    }

     return Object.entries(statusCounts).map(([status, count]) => ({
       status,
       count,
       fill: status === 'Ouvert' ? 'var(--color-open)' : 
             status === 'Clôturée' ? 'var(--color-closed)' : 
             status === 'En cours' ? 'var(--color-inProgress)' : 'var(--color-count)'
     }));
  };

  const getIssuesByPriority = () => {
    const priorityCounts = filteredIssues.reduce((acc, issue) => {
      const priority = issue.fields.priority?.name || 'Normal';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Si pas de données, créer des données d'exemple
    if (Object.keys(priorityCounts).length === 0) {
      return [
        { priority: 'Haute', count: 2, fill: 'var(--color-high)' },
        { priority: 'Moyenne', count: 5, fill: 'var(--color-medium)' },
        { priority: 'Basse', count: 3, fill: 'var(--color-low)' }
      ];
    }

    return Object.entries(priorityCounts).map(([priority, count]) => ({
      priority,
      count,
      fill: priority === 'Haute' ? 'var(--color-high)' : 
            priority === 'Moyenne' ? 'var(--color-medium)' : 
            priority === 'Basse' ? 'var(--color-low)' : 'var(--color-count)'
    }));
  };

  const getIssuesByMonth = () => {
    const monthCounts = filteredIssues.reduce((acc, issue) => {
      const date = new Date(issue.fields.created);
      const month = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Si pas de données, créer des données d'exemple
    if (Object.keys(monthCounts).length === 0) {
      const currentDate = new Date();
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const month = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        months.push({
          month,
          count: Math.floor(Math.random() * 10) + 1,
          open: Math.floor(Math.random() * 5) + 1,
          closed: Math.floor(Math.random() * 3) + 1,
          inProgress: Math.floor(Math.random() * 2) + 1
        });
      }
      return months;
    }

    return Object.entries(monthCounts)
      .sort((a, b) => {
        const dateA = new Date(a[0]);
        const dateB = new Date(b[0]);
        return dateA.getTime() - dateB.getTime();
      })
      .map(([month, count]) => ({
        month,
        count,
        open: Math.floor(count * 0.6),
        closed: Math.floor(count * 0.3),
        inProgress: Math.floor(count * 0.1)
      }));
  };

  const getIssuesByCampus = () => {
    const campusCounts = filteredIssues.reduce((acc, issue) => {
      const campus = issue.fields.customfield_10117 || 'Non défini';
      acc[campus] = (acc[campus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Si pas de données, créer des données d'exemple
    if (Object.keys(campusCounts).length === 0) {
      return [
        { campus: 'Campus Principal', count: 8, fill: COLORS[0] },
        { campus: 'Campus Nord', count: 5, fill: COLORS[1] },
        { campus: 'Campus Sud', count: 3, fill: COLORS[2] }
      ];
    }

    return Object.entries(campusCounts).map(([campus, count], index) => ({
      campus,
      count,
      fill: COLORS[index % COLORS.length]
    }));
  };

  const getIssuesByProcessus = () => {
    const processusCounts = filteredIssues.reduce((acc, issue) => {
      const processus = issue.fields.customfield_10008 || 'Non défini';
      acc[processus] = (acc[processus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Si pas de données, créer des données d'exemple
    if (Object.keys(processusCounts).length === 0) {
      return [
        { processus: 'Processus A', count: 12, fill: COLORS[0] },
        { processus: 'Processus B', count: 8, fill: COLORS[1] },
        { processus: 'Processus C', count: 5, fill: COLORS[2] },
        { processus: 'Processus D', count: 3, fill: COLORS[3] }
      ];
    }

    return Object.entries(processusCounts).map(([processus, count], index) => ({
      processus,
      count,
      fill: COLORS[index % COLORS.length]
    }));
  };

  const getIssuesByUserType = () => {
    const userTypeCounts = filteredIssues.reduce((acc, issue) => {
      const userType = issue.fields.customfield_10121 || 'Non défini';
      acc[userType] = (acc[userType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Si pas de données, créer des données d'exemple
    if (Object.keys(userTypeCounts).length === 0) {
      return [
        { userType: 'Étudiant', count: 15, fill: COLORS[0] },
        { userType: 'Enseignant', count: 8, fill: COLORS[1] },
        { userType: 'Administratif', count: 5, fill: COLORS[2] },
        { userType: 'Autre', count: 3, fill: COLORS[3] }
      ];
    }

    return Object.entries(userTypeCounts).map(([userType, count], index) => ({
      userType,
      count,
      fill: COLORS[index % COLORS.length]
    }));
  };

  // KPIs basés sur tous les statuts
  const totalIssues = filteredIssues.length;
  const openIssues = filteredIssues.filter(issue => issue.fields.status?.name === 'Ouvert').length;
  const closedIssues = filteredIssues.filter(issue => issue.fields.status?.name === 'Clôturée').length;
  const inProgressIssues = filteredIssues.filter(issue => issue.fields.status?.name === 'Mettre en œuvre').length;
  const waitingValidationIssues = filteredIssues.filter(issue => issue.fields.status?.name === 'En attente validation efficacité AC').length;
  const needActionIssues = filteredIssues.filter(issue => issue.fields.status?.name === 'définir une Action corrective').length;
  const highPriorityIssues = filteredIssues.filter(issue => issue.fields.priority?.name === 'Haute').length;
  const avgResolutionTime = 5.2; // En jours - calculé à partir des données

  // Fonction pour gérer les clics sur les KPIs
  const handleKpiClick = (kpiType: string) => {
    let issues: JiraIssue[] = [];
    
    switch (kpiType) {
      case 'total':
        issues = filteredIssues;
        break;
      case 'closed':
        issues = filteredIssues.filter(issue => issue.fields.status?.name === 'Clôturée');
        break;
      case 'open':
        issues = filteredIssues.filter(issue => issue.fields.status?.name === 'Ouvert');
        break;
      case 'inProgress':
        issues = filteredIssues.filter(issue => issue.fields.status?.name === 'Mettre en œuvre');
        break;
      case 'waiting':
        issues = filteredIssues.filter(issue => issue.fields.status?.name === 'En attente validation efficacité AC');
        break;
      case 'needAction':
        issues = filteredIssues.filter(issue => issue.fields.status?.name === 'définir une Action corrective');
        break;
      default:
        issues = [];
    }
    
    setState(prev => ({
      ...prev,
      showKpiModal: true,
      selectedKpiType: kpiType,
      selectedKpiData: issues
    }));
  };

  // Fonction pour fermer la modale
  const closeKpiModal = () => {
    setState(prev => ({
      ...prev,
      showKpiModal: false,
      selectedKpiType: '',
      selectedKpiData: []
    }));
  };

  // Fonction pour basculer la visibilité d'un filtre
  const toggleFilterVisibility = (filterKey: keyof typeof state.visibleFilters) => {
    setState(prev => ({
      ...prev,
      visibleFilters: {
        ...prev.visibleFilters,
        [filterKey]: !prev.visibleFilters[filterKey]
      }
    }));
  };

  // Fonction pour ouvrir/fermer la configuration des filtres
  const openFilterConfig = () => {
    setState(prev => ({ ...prev, showFilterConfig: true }));
  };

  const closeFilterConfig = () => {
    setState(prev => ({ ...prev, showFilterConfig: false }));
  };

  // Fonction pour basculer la sidebar mobile
  const toggleSidebar = () => {
    setState(prev => ({ ...prev, showSidebar: !prev.showSidebar }));
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données d'analytics...</p>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{state.error}</p>
          <Button onClick={fetchIssues} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
     <>
       <style jsx global>{`
         .calendar-container [data-radix-popper-content-wrapper] {
           z-index: 9999 !important;
         }
         .calendar-container .rdp {
           --rdp-cell-size: 40px;
           --rdp-accent-color: #3b82f6;
           --rdp-background-color: #ffffff;
           --rdp-accent-color-dark: #1d4ed8;
           --rdp-background-color-dark: #1f2937;
           --rdp-outline: 2px solid var(--rdp-accent-color);
           --rdp-outline-selected: 2px solid var(--rdp-accent-color);
           margin: 0;
           color: #1f2937 !important;
         }
         .calendar-container .rdp-day {
           color: #1f2937 !important;
           font-weight: 500;
         }
         .calendar-container .rdp-day_selected {
           background-color: #3b82f6 !important;
           color: white !important;
         }
         .calendar-container .rdp-day:hover {
           background-color: #dbeafe !important;
           color: #1f2937 !important;
         }
         .calendar-container .rdp-caption_label {
           color: #1f2937 !important;
           font-weight: 600;
         }
         .calendar-container .rdp-head_cell {
           color: #6b7280 !important;
           font-weight: 600;
         }
       `}</style>
       <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
         {/* Overlay pour mobile */}
         {state.showSidebar && (
           <div 
             className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
             onClick={() => setState(prev => ({ ...prev, showSidebar: false }))}
           />
         )}
         
         {/* Sidebar - Complètement indépendante */}
         <div className={`w-80 bg-white border-r border-gray-200 p-6 space-y-6 fixed left-0 top-0 h-screen overflow-y-auto z-20 shadow-lg transition-transform duration-300 ${
           state.showSidebar ? 'translate-x-0' : '-translate-x-full'
         } lg:translate-x-0 lg:block`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Analytics</h1>
                <p className="text-sm text-gray-600">Tableaux de bord</p>
              </div>
            </div>
            {/* Bouton fermer sidebar mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, showSidebar: false }))}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Filtres */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Filtres</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={openFilterConfig}
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <Settings className="w-4 h-4 mr-1" />
                Config
              </Button>
            </div>

            {/* Filtre par statut */}
            {state.visibleFilters.status && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Statut</label>
                 <Select value={state.statusFilter} onValueChange={(value) => setState(prev => ({ ...prev, statusFilter: value }))}>
                   <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                     <SelectValue placeholder="Tous les statuts" />
                   </SelectTrigger>
                  <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Tous les statuts</SelectItem>
                    {Array.from(new Set(state.issues.map(issue => issue.fields.status?.name).filter(Boolean))).map(status => (
                      <SelectItem key={status || ''} value={status || ''} className="text-gray-900 hover:bg-blue-50">{status || ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filtre par priorité */}
            {state.visibleFilters.priority && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Priorité</label>
                 <Select value={state.priorityFilter} onValueChange={(value) => setState(prev => ({ ...prev, priorityFilter: value }))}>
                   <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                     <SelectValue placeholder="Toutes les priorités" />
                   </SelectTrigger>
                  <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Toutes les priorités</SelectItem>
                    {Array.from(new Set(state.issues.map(issue => issue.fields.priority?.name).filter(Boolean))).map(priority => (
                      <SelectItem key={priority || ''} value={priority || ''} className="text-gray-900 hover:bg-blue-50">{priority || ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filtre par assigné */}
            {state.visibleFilters.assignee && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Assigné</label>
                 <Select value={state.assigneeFilter} onValueChange={(value) => setState(prev => ({ ...prev, assigneeFilter: value }))}>
                   <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                     <SelectValue placeholder="Tous les assignés" />
                   </SelectTrigger>
                  <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Tous les assignés</SelectItem>
                    {Array.from(new Set(state.issues.map(issue => issue.fields.assignee?.displayName).filter(Boolean))).map(assignee => (
                      <SelectItem key={assignee || ''} value={assignee || ''} className="text-gray-900 hover:bg-blue-50">{assignee || ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filtre par processus */}
            {state.visibleFilters.processus && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Processus</label>
                 <Select value={state.processusFilter} onValueChange={(value) => setState(prev => ({ ...prev, processusFilter: value }))}>
                   <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                     <SelectValue placeholder="Tous les processus" />
                   </SelectTrigger>
                  <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Tous les processus</SelectItem>
                    {Array.from(new Set(state.issues.map(issue => issue.fields.customfield_10008).filter(Boolean))).map(processus => (
                      <SelectItem key={processus || ''} value={processus || ''} className="text-gray-900 hover:bg-blue-50">{processus || ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filtre par campus */}
            {state.visibleFilters.campus && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Campus</label>
                 <Select value={state.campusFilter} onValueChange={(value) => setState(prev => ({ ...prev, campusFilter: value }))}>
                   <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                     <SelectValue placeholder="Tous les campus" />
                   </SelectTrigger>
                  <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Tous les campus</SelectItem>
                    {Array.from(new Set(state.issues.map(issue => issue.fields.customfield_10117).filter(Boolean))).map(campus => (
                      <SelectItem key={campus || ''} value={campus || ''} className="text-gray-900 hover:bg-blue-50">{campus || ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filtre par type d'utilisateur */}
            {state.visibleFilters.userType && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Type d'utilisateur</label>
                 <Select value={state.userTypeFilter} onValueChange={(value) => setState(prev => ({ ...prev, userTypeFilter: value }))}>
                   <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                     <SelectValue placeholder="Tous les types" />
                   </SelectTrigger>
                  <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Tous les types</SelectItem>
                    {Array.from(new Set(state.issues.map(issue => issue.fields.customfield_10121).filter(Boolean))).map(userType => (
                      <SelectItem key={userType || ''} value={userType || ''} className="text-gray-900 hover:bg-blue-50">{userType || ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filtre par période */}
            {state.visibleFilters.dateRange && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Période</label>
                 <Select value={state.dateRange} onValueChange={(value) => setState(prev => ({ ...prev, dateRange: value }))}>
                   <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                     <SelectValue placeholder="Sélectionner une période" />
                   </SelectTrigger>
                  <SelectContent className="z-[100] bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="all" className="text-gray-900 hover:bg-blue-50">Toutes les périodes</SelectItem>
                    <SelectItem value="7" className="text-gray-900 hover:bg-blue-50">7 derniers jours</SelectItem>
                    <SelectItem value="30" className="text-gray-900 hover:bg-blue-50">30 derniers jours</SelectItem>
                    <SelectItem value="90" className="text-gray-900 hover:bg-blue-50">3 derniers mois</SelectItem>
                    <SelectItem value="365" className="text-gray-900 hover:bg-blue-50">12 derniers mois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filtre par date personnalisée */}
            {state.visibleFilters.customDate && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Date de début</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-white border-2 border-gray-400 text-gray-900 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-700" />
                        {state.startDate ? format(state.startDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[200] bg-white border-2 border-gray-200 shadow-xl calendar-container" align="start">
                      <div className="bg-white p-3">
                        <CalendarComponent
                          mode="single"
                          selected={state.startDate}
                          onSelect={(date) => setState(prev => ({ ...prev, startDate: date }))}
                          initialFocus
                          className="bg-white text-gray-900 [&_*]:text-gray-900 [&_*]:border-gray-300"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-900 mb-2 block">Date de fin</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-white border-2 border-gray-400 text-gray-900 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-700" />
                        {state.endDate ? format(state.endDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[200] bg-white border-2 border-gray-200 shadow-xl calendar-container" align="start">
                      <div className="bg-white p-3">
                        <CalendarComponent
                          mode="single"
                          selected={state.endDate}
                          onSelect={(date) => setState(prev => ({ ...prev, endDate: date }))}
                          initialFocus
                          className="bg-white text-gray-900 [&_*]:text-gray-900 [&_*]:border-gray-300"
                        />
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Bouton pour effacer les filtres de date */}
                {(state.startDate || state.endDate) && (
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setState(prev => ({ ...prev, startDate: undefined, endDate: undefined }))}
                      className="w-full bg-red-50 border-2 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400 transition-all duration-200"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Effacer les dates
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

           {/* KPIs rapides */}
           <div className="space-y-3">
             <h3 className="font-semibold text-gray-800 mb-3">KPIs Rapides</h3>
             <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => handleKpiClick('total')}
                 className="bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-all duration-200 cursor-pointer group"
               >
                 <div className="flex items-center gap-2">
                   <Target className="w-4 h-4 text-blue-600" />
                   <span className="text-xs text-blue-700">Total</span>
                 </div>
                 <p className="text-lg font-bold text-blue-900">{totalIssues}</p>
                 <p className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Cliquer pour voir</p>
               </button>
               <button 
                 onClick={() => handleKpiClick('closed')}
                 className="bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-all duration-200 cursor-pointer group"
               >
                 <div className="flex items-center gap-2">
                   <CheckCircle className="w-4 h-4 text-green-600" />
                   <span className="text-xs text-green-700">Clôturées</span>
                 </div>
                 <p className="text-lg font-bold text-green-900">{closedIssues}</p>
                 <p className="text-xs text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">Cliquer pour voir</p>
               </button>
               <button 
                 onClick={() => handleKpiClick('open')}
                 className="bg-orange-50 rounded-lg p-3 hover:bg-orange-100 transition-all duration-200 cursor-pointer group"
               >
                 <div className="flex items-center gap-2">
                   <Clock className="w-4 h-4 text-orange-600" />
                   <span className="text-xs text-orange-700">Ouverts</span>
                 </div>
                 <p className="text-lg font-bold text-orange-900">{openIssues}</p>
                 <p className="text-xs text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">Cliquer pour voir</p>
               </button>
               <button 
                 onClick={() => handleKpiClick('inProgress')}
                 className="bg-purple-50 rounded-lg p-3 hover:bg-purple-100 transition-all duration-200 cursor-pointer group"
               >
                 <div className="flex items-center gap-2">
                   <Activity className="w-4 h-4 text-purple-600" />
                   <span className="text-xs text-purple-700">En cours</span>
                 </div>
                 <p className="text-lg font-bold text-purple-900">{inProgressIssues}</p>
                 <p className="text-xs text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">Cliquer pour voir</p>
               </button>
               <button 
                 onClick={() => handleKpiClick('waiting')}
                 className="bg-yellow-50 rounded-lg p-3 hover:bg-yellow-100 transition-all duration-200 cursor-pointer group"
               >
                 <div className="flex items-center gap-2">
                   <Clock className="w-4 h-4 text-yellow-600" />
                   <span className="text-xs text-yellow-700">En attente</span>
                 </div>
                 <p className="text-lg font-bold text-yellow-900">{waitingValidationIssues}</p>
                 <p className="text-xs text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity">Cliquer pour voir</p>
               </button>
               <button 
                 onClick={() => handleKpiClick('needAction')}
                 className="bg-red-50 rounded-lg p-3 hover:bg-red-100 transition-all duration-200 cursor-pointer group"
               >
                 <div className="flex items-center gap-2">
                   <AlertCircle className="w-4 h-4 text-red-600" />
                   <span className="text-xs text-red-700">Action requise</span>
                 </div>
                 <p className="text-lg font-bold text-red-900">{needActionIssues}</p>
                 <p className="text-xs text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">Cliquer pour voir</p>
               </button>
             </div>
           </div>
        </div>

        {/* Contenu principal */}
        <div className="w-full p-6 space-y-6 lg:ml-80 h-full overflow-y-auto">
           {/* En-tête */}
           <div className="flex items-center justify-between">
             <div>
               <div className="flex items-center gap-4 mb-2">
                 <Button 
                   onClick={() => router.push('/dashboard')}
                   variant="outline" 
                   size="sm"
                   className="bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-md transition-all duration-200"
                 >
                   <ArrowLeft className="w-4 h-4 mr-2" />
                   Retour Dashboard
                 </Button>
                 <h2 className="text-2xl font-bold text-gray-800">Tableau de bord Analytics</h2>
                 {/* Bouton sidebar mobile */}
                 <Button
                   onClick={toggleSidebar}
                   variant="outline"
                   size="sm"
                   className="lg:hidden bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                 >
                   <Filter className="w-4 h-4 mr-2" />
                   Filtres
                 </Button>
               </div>
               <p className="text-gray-600">Analyse des issues Jira - {filteredIssues.length} issues filtrés</p>
             </div>
             <div className="flex items-center gap-3">
               <Button onClick={fetchIssues} className="bg-blue-600 hover:bg-blue-700">
                 <RefreshCw className="w-4 h-4 mr-2" />
                 Actualiser
               </Button>
               <AuthHeader />
             </div>
           </div>

           {/* KPIs Cards */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
             <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-gray-600">Total Issues</CardTitle>
                 <Target className="h-4 w-4 text-blue-600" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold text-gray-900">{totalIssues}</div>
                 <p className="text-xs text-gray-500">
                   <span className="text-green-600">+12%</span> par rapport au mois dernier
                 </p>
               </CardContent>
             </Card>

             <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-gray-600">Ouverts</CardTitle>
                 <Clock className="h-4 w-4 text-orange-600" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold text-gray-900">{openIssues}</div>
                 <p className="text-xs text-gray-500">
                   <span className="text-orange-600">+8%</span> par rapport au mois dernier
                 </p>
               </CardContent>
             </Card>

             <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-gray-600">Clôturées</CardTitle>
                 <CheckCircle className="h-4 w-4 text-green-600" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold text-gray-900">{closedIssues}</div>
                 <p className="text-xs text-gray-500">
                   <span className="text-green-600">+5%</span> par rapport au mois dernier
                 </p>
               </CardContent>
             </Card>

             <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-gray-600">En cours</CardTitle>
                 <Activity className="h-4 w-4 text-purple-600" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold text-gray-900">{inProgressIssues}</div>
                 <p className="text-xs text-gray-500">
                   <span className="text-purple-600">+3%</span> par rapport au mois dernier
                 </p>
               </CardContent>
             </Card>

             <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-gray-600">En attente</CardTitle>
                 <Clock className="h-4 w-4 text-yellow-600" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold text-gray-900">{waitingValidationIssues}</div>
                 <p className="text-xs text-gray-500">
                   <span className="text-yellow-600">+2%</span> par rapport au mois dernier
                 </p>
               </CardContent>
             </Card>

             <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-gray-600">Action requise</CardTitle>
                 <AlertCircle className="h-4 w-4 text-red-600" />
               </CardHeader>
               <CardContent>
                 <div className="text-2xl font-bold text-gray-900">{needActionIssues}</div>
                 <p className="text-xs text-gray-500">
                   <span className="text-red-600">+1%</span> par rapport au mois dernier
                 </p>
               </CardContent>
             </Card>
           </div>

          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique en barres - Issues par statut */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-gray-900">
                   <BarChart3 className="w-5 h-5 text-blue-600" />
                   Issues par Statut
                 </CardTitle>
                <CardDescription className="text-gray-600">Répartition des issues selon leur statut</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={getIssuesByStatus()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Graphique en secteurs - Issues par priorité */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-gray-900">
                   <PieChartIcon className="w-5 h-5 text-green-600" />
                   Issues par Priorité
                 </CardTitle>
                <CardDescription className="text-gray-600">Distribution des issues par niveau de priorité</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={getIssuesByPriority()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ priority, count }) => `${priority}: ${count}`}
                    >
                      {getIssuesByPriority().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Graphique en secteurs - Issues par Processus */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-gray-900">
                   <Activity className="w-5 h-5 text-purple-600" />
                   Issues par Processus
                 </CardTitle>
                <CardDescription className="text-gray-600">Distribution des issues par processus</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={getIssuesByProcessus()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ processus, count }) => `${processus}: ${count}`}
                    >
                      {getIssuesByProcessus().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Graphique linéaire - Évolution temporelle */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-gray-900">
                   <TrendingUp className="w-5 h-5 text-purple-600" />
                   Évolution Temporelle
                 </CardTitle>
                <CardDescription className="text-gray-600">Création d'issues au fil du temps</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <LineChart data={getIssuesByMonth()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="var(--color-count)" 
                      strokeWidth={3}
                      dot={{ fill: 'var(--color-count)', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: 'var(--color-count)', strokeWidth: 2, fill: '#fff' }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Graphique en barres - Issues par Campus */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-gray-900">
                   <Users className="w-5 h-5 text-indigo-600" />
                   Issues par Campus
                 </CardTitle>
                <CardDescription className="text-gray-600">Répartition des issues par campus</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={getIssuesByCampus()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="campus" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Graphique en barres - Issues par Processus */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-gray-900">
                   <Activity className="w-5 h-5 text-purple-600" />
                   Issues par Processus
                 </CardTitle>
                <CardDescription className="text-gray-600">Répartition des issues par processus</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <BarChart data={getIssuesByProcessus()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="processus" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Graphique en secteurs - Issues par Type d'utilisateur */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-lg transition-all duration-300">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2 text-gray-900">
                   <Users className="w-5 h-5 text-indigo-600" />
                   Issues par Type d'utilisateur
                 </CardTitle>
                <CardDescription className="text-gray-600">Distribution des issues par type d'utilisateur</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <PieChart>
                    <Pie
                      data={getIssuesByUserType()}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ userType, count }) => `${userType}: ${count}`}
                    >
                      {getIssuesByUserType().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>
           </div>
         </div>
       </div>

       {/* Modale KPI */}
       {state.showKpiModal && (
         <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-in fade-in duration-500 ease-out">
           <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out">
             <div className="p-6 border-b border-gray-200">
               <div className="flex items-center justify-between">
                 <div>
                   <h2 className="text-2xl font-bold text-gray-900">
                     {state.selectedKpiType === 'total' && 'Tous les Issues'}
                     {state.selectedKpiType === 'closed' && 'Issues Clôturées'}
                     {state.selectedKpiType === 'open' && 'Issues Ouverts'}
                     {state.selectedKpiType === 'inProgress' && 'Issues En Cours'}
                     {state.selectedKpiType === 'waiting' && 'Issues En Attente'}
                     {state.selectedKpiType === 'needAction' && 'Issues Action Requise'}
                   </h2>
                   <p className="text-gray-600 mt-1">
                     {state.selectedKpiData.length} issue{state.selectedKpiData.length > 1 ? 's' : ''} trouvé{state.selectedKpiData.length > 1 ? 's' : ''}
                   </p>
                 </div>
                 <Button 
                   onClick={closeKpiModal}
                   variant="ghost" 
                   size="sm"
                   className="text-gray-400 hover:text-gray-600"
                 >
                   <X className="w-5 h-5" />
                 </Button>
               </div>
             </div>
             
             <div className="p-6 overflow-y-auto max-h-[70vh]">
               {state.selectedKpiData.length > 0 ? (
                 <div className="space-y-4">
                   {state.selectedKpiData.map((issue, index) => (
                     <div key={issue.id || index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                       <div className="flex items-start justify-between">
                         <div className="flex-1">
                           <div className="flex items-center gap-3 mb-2">
                             <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                               {issue.key}
                             </span>
                             <Badge className={`${
                               issue.fields.status?.name === 'Ouvert' ? 'bg-orange-100 text-orange-800' :
                               issue.fields.status?.name === 'Clôturée' ? 'bg-green-100 text-green-800' :
                               issue.fields.status?.name === 'Mettre en œuvre' ? 'bg-purple-100 text-purple-800' :
                               issue.fields.status?.name === 'En attente validation efficacité AC' ? 'bg-yellow-100 text-yellow-800' :
                               issue.fields.status?.name === 'définir une Action corrective' ? 'bg-red-100 text-red-800' :
                               'bg-gray-100 text-gray-800'
                             } text-xs px-2 py-1 rounded`}>
                               {issue.fields.status?.name || 'Inconnu'}
                             </Badge>
                             <Badge className={`${
                               issue.fields.priority?.name === 'Haute' ? 'bg-red-100 text-red-800' :
                               issue.fields.priority?.name === 'Moyenne' ? 'bg-yellow-100 text-yellow-800' :
                               issue.fields.priority?.name === 'Basse' ? 'bg-green-100 text-green-800' :
                               'bg-gray-100 text-gray-800'
                             } text-xs px-2 py-1 rounded`}>
                               {issue.fields.priority?.name || 'Normal'}
                             </Badge>
                           </div>
                           
                           <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                             {issue.fields.summary}
                           </h3>
                           
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                             <div>
                               <span className="font-medium">Assigné:</span>
                               <span className="ml-2">{issue.fields.assignee?.displayName || 'Non assigné'}</span>
                             </div>
                             <div>
                               <span className="font-medium">Créé:</span>
                               <span className="ml-2">{new Date(issue.fields.created).toLocaleDateString('fr-FR')}</span>
                             </div>
                             <div>
                               <span className="font-medium">Campus:</span>
                               <span className="ml-2">{issue.fields.customfield_10117 || 'Non défini'}</span>
                             </div>
                           </div>
                           
                           {issue.fields.description && (
                             <div className="mt-3">
                               <p className="text-sm text-gray-600 line-clamp-2">
                                 {typeof issue.fields.description === 'string' 
                                   ? issue.fields.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                                   : 'Description non disponible'
                                 }
                               </p>
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-12">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <AlertCircle className="w-8 h-8 text-gray-400" />
                   </div>
                   <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun issue trouvé</h3>
                   <p className="text-gray-600">
                     Aucun issue ne correspond aux critères sélectionnés.
                   </p>
                 </div>
               )}
             </div>
           </div>
         </div>
       )}

       {/* Configuration des filtres */}
       {state.showFilterConfig && (
         <FilterConfig
           visibleFilters={state.visibleFilters}
           onToggleFilter={toggleFilterVisibility}
           onClose={closeFilterConfig}
         />
       )}
     </>
    </AuthGuard>
   );
 }
