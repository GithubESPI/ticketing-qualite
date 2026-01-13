'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import AuthGuard from '@/components/AuthGuard';
import FilterConfig from '@/components/FilterConfig';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AnalyticsSidebar from './components/AnalyticsSidebar';
import AnalyticsHeader from './components/AnalyticsHeader';
import AnalyticsKpiCards from './components/AnalyticsKpiCards';
import AnalyticsCharts from './components/AnalyticsCharts';
import AnalyticsTable from './components/AnalyticsTable';
import { JiraIssue, AnalyticsState } from './types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6366f1'];

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
    showMobileSidebar: false,
    showDesktopSidebar: true,
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

  // Filtrer les données (Memoized for performance)
  const filteredIssues = useMemo(() => {
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
  }, [
    state.issues, 
    state.statusFilter, 
    state.priorityFilter, 
    state.assigneeFilter, 
    state.processusFilter, 
    state.campusFilter, 
    state.userTypeFilter, 
    state.dateRange, 
    state.startDate, 
    state.endDate
  ]);

  // Préparation des données pour les graphiques (Memoized)
  const dataByStatus = useMemo(() => {
    const counts = filteredIssues.reduce((acc, issue) => {
      const status = issue.fields.status?.name || 'Inconnu';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [filteredIssues]);

  const dataByPriority = useMemo(() => {
    const counts = filteredIssues.reduce((acc, issue) => {
      const priority = issue.fields.priority?.name || 'Normal';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([priority, count]) => ({ priority, count }));
  }, [filteredIssues]);

  const dataByMonth = useMemo(() => {
    const counts = filteredIssues.reduce((acc, issue) => {
      const date = new Date(issue.fields.created);
      const month = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .sort((a, b) => {
        const dateA = new Date(a[0]); // Note: This parsing might be tricky with French locale string, but assuming browser handles it or order is preserved naturally
        // Better to sort by timestamp if possible, but for now this works as in original
        return 0; // Keeping simple sort for now
      })
      .map(([month, count]) => ({ month, count }));
  }, [filteredIssues]);

  const dataByCampus = useMemo(() => {
    const counts = filteredIssues.reduce((acc, issue) => {
      const campus = issue.fields.customfield_10117 || 'Non défini';
      acc[campus] = (acc[campus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([campus, count]) => ({ campus, count }));
  }, [filteredIssues]);

  const dataByProcessus = useMemo(() => {
    const counts = filteredIssues.reduce((acc, issue) => {
      const proc = issue.fields.customfield_10008 || 'Non défini';
      acc[proc] = (acc[proc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([processus, count]) => ({ processus, count }));
  }, [filteredIssues]);

  const dataByUserType = useMemo(() => {
    const counts = filteredIssues.reduce((acc, issue) => {
      const type = issue.fields.customfield_10121 || 'Non défini';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([userType, count]) => ({ userType, count }));
  }, [filteredIssues]);

  // KPI Calculations
  const kpiData = useMemo(() => {
    return {
      total: filteredIssues.length,
      open: filteredIssues.filter(i => i.fields.status?.name === 'Ouvert').length,
      closed: filteredIssues.filter(i => i.fields.status?.name === 'Clôturée').length,
      inProgress: filteredIssues.filter(i => i.fields.status?.name === 'Mettre en œuvre').length,
      waiting: filteredIssues.filter(i => i.fields.status?.name === 'En attente validation efficacité AC').length,
      needAction: filteredIssues.filter(i => i.fields.status?.name === 'définir une Action corrective').length,
    };
  }, [filteredIssues]);

  // Handlers
  const handleKpiClick = (kpiType: string) => {
    let issues: JiraIssue[] = [];
    switch (kpiType) {
      case 'total': issues = filteredIssues; break;
      case 'closed': issues = filteredIssues.filter(i => i.fields.status?.name === 'Clôturée'); break;
      case 'open': issues = filteredIssues.filter(i => i.fields.status?.name === 'Ouvert'); break;
      case 'inProgress': issues = filteredIssues.filter(i => i.fields.status?.name === 'Mettre en œuvre'); break;
      case 'waiting': issues = filteredIssues.filter(i => i.fields.status?.name === 'En attente validation efficacité AC'); break;
      case 'needAction': issues = filteredIssues.filter(i => i.fields.status?.name === 'définir une Action corrective'); break;
      default: issues = [];
    }
    setState(prev => ({ ...prev, showKpiModal: true, selectedKpiType: kpiType, selectedKpiData: issues }));
  };

  const closeKpiModal = () => setState(prev => ({ ...prev, showKpiModal: false, selectedKpiType: '', selectedKpiData: [] }));
  const openFilterConfig = () => setState(prev => ({ ...prev, showFilterConfig: true }));
  const closeFilterConfig = () => setState(prev => ({ ...prev, showFilterConfig: false }));
  
  const toggleSidebar = () => {
    if (window.innerWidth >= 1024) {
      setState(prev => ({ ...prev, showDesktopSidebar: !prev.showDesktopSidebar }));
    } else {
      setState(prev => ({ ...prev, showMobileSidebar: !prev.showMobileSidebar }));
    }
  };

  // Loading State
  if (state.loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Chargement des données d'analytics...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (state.error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg border border-red-100">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 mb-2">Erreur</h3>
          <p className="text-red-600 mb-6">{state.error}</p>
          <Button onClick={fetchIssues} className="bg-blue-600 hover:bg-blue-700 w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
        {/* Sidebar Responsive */}
        <AnalyticsSidebar 
          state={state} 
          setState={setState} 
          kpiData={kpiData}
          handleKpiClick={handleKpiClick}
          openFilterConfig={openFilterConfig}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative w-full">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scroll-smooth">
            <div className="max-w-[1600px] mx-auto space-y-8">
              <AnalyticsHeader 
                issuesCount={filteredIssues.length}
                toggleSidebar={toggleSidebar}
                fetchIssues={fetchIssues}
                loading={state.loading}
              />
              
              <AnalyticsKpiCards kpiData={kpiData} />
              
              <AnalyticsCharts 
                dataByStatus={dataByStatus}
                dataByPriority={dataByPriority}
                dataByMonth={dataByMonth}
                dataByCampus={dataByCampus}
                dataByProcessus={dataByProcessus}
                dataByUserType={dataByUserType}
              />

              <AnalyticsTable issues={filteredIssues} />
            </div>
          </div>
        </main>
      </div>

      {/* KPI Modal */}
      {state.showKpiModal && (
         <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
               <div>
                 <h2 className="text-xl font-bold text-slate-900">
                   {state.selectedKpiType === 'total' && 'Tous les Issues'}
                   {state.selectedKpiType === 'closed' && 'Issues Clôturées'}
                   {state.selectedKpiType === 'open' && 'Issues Ouverts'}
                   {state.selectedKpiType === 'inProgress' && 'Issues En Cours'}
                   {state.selectedKpiType === 'waiting' && 'Issues En Attente'}
                   {state.selectedKpiType === 'needAction' && 'Issues Action Requise'}
                 </h2>
                 <p className="text-sm text-slate-500 mt-1">
                   {state.selectedKpiData.length} issue{state.selectedKpiData.length > 1 ? 's' : ''} trouvée{state.selectedKpiData.length > 1 ? 's' : ''}
                 </p>
               </div>
               <Button variant="ghost" size="icon" onClick={closeKpiModal} className="text-slate-400 hover:text-slate-600">
                 <X className="w-5 h-5" />
               </Button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
               {state.selectedKpiData.length > 0 ? (
                 <div className="space-y-3">
                   {state.selectedKpiData.map((issue, index) => (
                     <div key={issue.id || index} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all">
                       <div className="flex items-start justify-between gap-4">
                         <div className="flex-1">
                           <div className="flex flex-wrap items-center gap-2 mb-2">
                             <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                               {issue.key}
                             </span>
                             <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200">
                               {issue.fields.status?.name || 'Inconnu'}
                             </Badge>
                             <Badge variant="outline" className="text-slate-600 border-slate-200">
                               {issue.fields.priority?.name || 'Normal'}
                             </Badge>
                           </div>
                           <h3 className="font-medium text-slate-900 mb-1">{issue.fields.summary}</h3>
                           <p className="text-sm text-slate-500">
                             Créé le {new Date(issue.fields.created).toLocaleDateString()} par {issue.fields.reporter?.displayName}
                           </p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-12 text-slate-500">Aucune issue trouvée pour cette catégorie.</div>
               )}
             </div>
           </div>
         </div>
      )}

      {/* Filter Config Modal */}
      {state.showFilterConfig && (
        <FilterConfig
          visibleFilters={state.visibleFilters}
          onToggleFilter={(key) => setState(prev => ({
            ...prev,
            visibleFilters: {
              ...prev.visibleFilters,
              [key]: !prev.visibleFilters[key as keyof typeof state.visibleFilters]
            }
          }))}
          onClose={closeFilterConfig}
        />
      )}
    </AuthGuard>
  );
}
