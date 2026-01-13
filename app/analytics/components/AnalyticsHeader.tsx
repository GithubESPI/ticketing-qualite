import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter, RefreshCw, LogOut, Menu } from 'lucide-react';
import AuthHeader from '@/components/AuthHeader';
import { useRouter } from 'next/navigation';

interface AnalyticsHeaderProps {
  issuesCount: number;
  toggleSidebar: () => void;
  fetchIssues: () => void;
  loading: boolean;
}

export default function AnalyticsHeader({ 
  issuesCount, 
  toggleSidebar, 
  fetchIssues, 
  loading 
}: AnalyticsHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4 mb-6">
      {/* Section gauche */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => router.push('/dashboard')}
            variant="outline" 
            size="sm"
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Retour</span>
          </Button>
          
          {/* Bouton sidebar (Menu/Filtres) */}
          <Button
            onClick={toggleSidebar}
            variant="outline"
            size="sm"
            className="bg-white border-slate-200 text-slate-700 hover:text-blue-600"
            title="Afficher/Masquer le menu"
          >
            <Menu className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Menu</span>
          </Button>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Tableau de bord</h2>
          <p className="text-sm text-slate-500 font-medium">{issuesCount} issues analysées</p>
        </div>
      </div>
      
      {/* Section droite - Actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        <div className="hidden md:block">
          <AuthHeader />
        </div>
        
        <Button 
          onClick={fetchIssues} 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow transition-all"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Actualiser</span>
          <span className="sm:hidden">Refresh</span>
        </Button>

        <Button 
          onClick={() => window.location.href = '/api/auth/signout?callbackUrl=/'}
          variant="ghost"
          size="icon"
          className="text-slate-400 hover:text-red-600 hover:bg-red-50"
          title="Déconnexion"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
