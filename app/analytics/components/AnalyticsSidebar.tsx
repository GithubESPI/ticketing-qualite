import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  BarChart3, 
  X, 
  Filter, 
  Settings, 
  CalendarIcon, 
  Target, 
  CheckCircle, 
  Clock, 
  Activity, 
  AlertCircle,
  ChevronLeft
} from 'lucide-react';
import { AnalyticsState } from '../types';

interface AnalyticsSidebarProps {
  state: AnalyticsState;
  setState: React.Dispatch<React.SetStateAction<AnalyticsState>>;
  kpiData: {
    total: number;
    closed: number;
    open: number;
    inProgress: number;
    waiting: number;
    needAction: number;
  };
  handleKpiClick: (type: string) => void;
  openFilterConfig: () => void;
}

export default function AnalyticsSidebar({ 
  state, 
  setState, 
  kpiData, 
  handleKpiClick, 
  openFilterConfig 
}: AnalyticsSidebarProps) {
  
  // Helper to get unique values for filters
  const getUniqueValues = (key: string, nestedKey?: string) => {
    const values = state.issues.map(issue => {
      // @ts-ignore
      const val = nestedKey ? issue.fields[key]?.[nestedKey] : issue.fields[key];
      return val;
    }).filter(Boolean);
    return Array.from(new Set(values));
  };

  return (
    <>
      {/* Overlay pour mobile */}
      {state.showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-200"
          onClick={() => setState(prev => ({ ...prev, showMobileSidebar: false }))}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-full bg-white border-r border-slate-200 
        z-40 shadow-2xl lg:shadow-none overflow-y-auto 
        transition-all duration-300 ease-in-out
        ${state.showMobileSidebar ? 'translate-x-0 w-[85%] sm:w-80 p-4 sm:p-6' : '-translate-x-full w-[85%] sm:w-80 p-4 sm:p-6'} 
        lg:translate-x-0 lg:static lg:h-screen
        ${state.showDesktopSidebar ? 'lg:w-80 lg:opacity-100' : 'lg:w-0 lg:opacity-0 lg:p-0 lg:border-none lg:overflow-hidden'}
      `}>
        <div className="flex items-center justify-between mb-8 min-w-[240px]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Analytics</h1>
              <p className="text-sm text-slate-500 font-medium">Tableaux de bord</p>
            </div>
          </div>
          
          {/* Close button for Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setState(prev => ({ ...prev, showMobileSidebar: false }))}
            className="lg:hidden text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Collapse button for Desktop */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setState(prev => ({ ...prev, showDesktopSidebar: false }))}
            className="hidden lg:flex text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            title="Réduire le menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Contenu avec min-width pour éviter le reflow pendant la transition */}
        <div className="min-w-[240px] space-y-6">
          {/* Filtres */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-slate-100 p-1.5 rounded-md">
                  <Filter className="w-4 h-4 text-slate-600" />
                </div>
                <h3 className="font-semibold text-slate-800">Filtres actifs</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={openFilterConfig}
                className="h-8 text-xs font-medium border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Config
              </Button>
            </div>

            <div className="space-y-4 pr-1">
              {/* Filtre par statut */}
              {state.visibleFilters.status && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Statut</label>
                  <Select value={state.statusFilter} onValueChange={(value) => setState(prev => ({ ...prev, statusFilter: value }))}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-700 h-9 focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
                      <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      {getUniqueValues('status', 'name').map((status: any) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filtre par priorité */}
              {state.visibleFilters.priority && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Priorité</label>
                  <Select value={state.priorityFilter} onValueChange={(value) => setState(prev => ({ ...prev, priorityFilter: value }))}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-700 h-9 focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
                      <SelectValue placeholder="Toutes les priorités" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les priorités</SelectItem>
                      {getUniqueValues('priority', 'name').map((priority: any) => (
                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filtre par assigné */}
              {state.visibleFilters.assignee && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigné</label>
                  <Select value={state.assigneeFilter} onValueChange={(value) => setState(prev => ({ ...prev, assigneeFilter: value }))}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-700 h-9 focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
                      <SelectValue placeholder="Tous les assignés" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les assignés</SelectItem>
                      {getUniqueValues('assignee', 'displayName').map((assignee: any) => (
                        <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filtre par processus */}
              {state.visibleFilters.processus && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Processus</label>
                  <Select value={state.processusFilter} onValueChange={(value) => setState(prev => ({ ...prev, processusFilter: value }))}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-700 h-9 focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
                      <SelectValue placeholder="Tous les processus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les processus</SelectItem>
                      {/* @ts-ignore */}
                      {Array.from(new Set(state.issues.map(issue => issue.fields.customfield_10008).filter(Boolean))).map((processus: any) => (
                        <SelectItem key={processus} value={processus}>{processus}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filtre par campus */}
              {state.visibleFilters.campus && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Campus</label>
                  <Select value={state.campusFilter} onValueChange={(value) => setState(prev => ({ ...prev, campusFilter: value }))}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-700 h-9 focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
                      <SelectValue placeholder="Tous les campus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les campus</SelectItem>
                      {/* @ts-ignore */}
                      {Array.from(new Set(state.issues.map(issue => issue.fields.customfield_10117).filter(Boolean))).map((campus: any) => (
                        <SelectItem key={campus} value={campus}>{campus}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filtre par type d'utilisateur */}
              {state.visibleFilters.userType && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Type d'utilisateur</label>
                  <Select value={state.userTypeFilter} onValueChange={(value) => setState(prev => ({ ...prev, userTypeFilter: value }))}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-700 h-9 focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {/* @ts-ignore */}
                      {Array.from(new Set(state.issues.map(issue => issue.fields.customfield_10121).filter(Boolean))).map((userType: any) => (
                        <SelectItem key={userType} value={userType}>{userType}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filtre par période */}
              {state.visibleFilters.dateRange && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Période</label>
                  <Select value={state.dateRange} onValueChange={(value) => setState(prev => ({ ...prev, dateRange: value }))}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-700 h-9 focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
                      <SelectValue placeholder="Sélectionner une période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les périodes</SelectItem>
                      <SelectItem value="7">7 derniers jours</SelectItem>
                      <SelectItem value="30">30 derniers jours</SelectItem>
                      <SelectItem value="90">3 derniers mois</SelectItem>
                      <SelectItem value="365">12 derniers mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Filtre par date personnalisée */}
              {state.visibleFilters.customDate && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Du</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-slate-50 border-slate-200 text-slate-700 hover:bg-white h-9"
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-500" />
                          {state.startDate ? format(state.startDate, "dd/MM/yyyy", { locale: fr }) : "Date de début"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[200] calendar-container" align="start">
                        <div className="bg-white p-2">
                          <CalendarComponent
                            mode="single"
                            selected={state.startDate}
                            onSelect={(date) => setState(prev => ({ ...prev, startDate: date }))}
                            initialFocus
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Au</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-slate-50 border-slate-200 text-slate-700 hover:bg-white h-9"
                        >
                          <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-500" />
                          {state.endDate ? format(state.endDate, "dd/MM/yyyy", { locale: fr }) : "Date de fin"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-[200] calendar-container" align="start">
                        <div className="bg-white p-2">
                          <CalendarComponent
                            mode="single"
                            selected={state.endDate}
                            onSelect={(date) => setState(prev => ({ ...prev, endDate: date }))}
                            initialFocus
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {(state.startDate || state.endDate) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setState(prev => ({ ...prev, startDate: undefined, endDate: undefined }))}
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
                    >
                      <X className="w-3.5 h-3.5 mr-1.5" />
                      Effacer les dates
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* KPIs rapides */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-slate-100 p-1.5 rounded-md">
                  <Target className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-800">Aperçu rapide</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <KpiMiniCard 
                label="Total" 
                value={kpiData.total} 
                icon={Target} 
                color="blue" 
                onClick={() => handleKpiClick('total')} 
              />
              <KpiMiniCard 
                label="Clôturées" 
                value={kpiData.closed} 
                icon={CheckCircle} 
                color="emerald" 
                onClick={() => handleKpiClick('closed')} 
              />
              <KpiMiniCard 
                label="Ouverts" 
                value={kpiData.open} 
                icon={Clock} 
                color="amber" 
                onClick={() => handleKpiClick('open')} 
              />
              <KpiMiniCard 
                label="En cours" 
                value={kpiData.inProgress} 
                icon={Activity} 
                color="violet" 
                onClick={() => handleKpiClick('inProgress')} 
              />
              <KpiMiniCard 
                label="En attente" 
                value={kpiData.waiting} 
                icon={Clock} 
                color="yellow" 
                onClick={() => handleKpiClick('waiting')} 
              />
              <KpiMiniCard 
                label="Action" 
                value={kpiData.needAction} 
                icon={AlertCircle} 
                color="rose" 
                onClick={() => handleKpiClick('needAction')} 
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function KpiMiniCard({ label, value, icon: Icon, color, onClick }: any) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100",
    violet: "bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-100 hover:bg-yellow-100",
    rose: "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100",
  };

  // @ts-ignore
  const currentClass = colorClasses[color] || colorClasses.blue;

  return (
    <button 
      onClick={onClick}
      className={`${currentClass} p-3 rounded-xl border transition-all duration-200 text-left group w-full`}
    >
      <div className="flex items-center gap-1.5 mb-1.5 opacity-80 group-hover:opacity-100">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </button>
  );
}
