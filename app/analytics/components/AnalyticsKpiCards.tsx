import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, CheckCircle, Clock, Activity, AlertCircle } from 'lucide-react';

interface AnalyticsKpiCardsProps {
  kpiData: {
    total: number;
    closed: number;
    open: number;
    inProgress: number;
    waiting: number;
    needAction: number;
  };
}

export default function AnalyticsKpiCards({ kpiData }: AnalyticsKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <KpiCard
        title="Total Issues"
        value={kpiData.total}
        icon={Target}
        color="blue"
        trend="+12%"
      />
      <KpiCard
        title="Ouverts"
        value={kpiData.open}
        icon={Clock}
        color="amber"
        trend="+8%"
      />
      <KpiCard
        title="Clôturées"
        value={kpiData.closed}
        icon={CheckCircle}
        color="emerald"
        trend="+5%"
      />
      <KpiCard
        title="En cours"
        value={kpiData.inProgress}
        icon={Activity}
        color="violet"
        trend="+3%"
      />
      <KpiCard
        title="En attente"
        value={kpiData.waiting}
        icon={Clock}
        color="yellow"
        trend="+2%"
      />
      <KpiCard
        title="Action requise"
        value={kpiData.needAction}
        icon={AlertCircle}
        color="rose"
        trend="+1%"
      />
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color, trend }: any) {
  const colorMap = {
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    violet: "text-violet-600",
    yellow: "text-yellow-600",
    rose: "text-rose-600",
  };

  // @ts-ignore
  const iconColor = colorMap[color] || "text-slate-600";
  // @ts-ignore
  const trendColor = colorMap[color] || "text-slate-600";

  return (
    <Card className="bg-white/60 backdrop-blur-md border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300 group">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-white shadow-sm ring-1 ring-slate-100 ${iconColor}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <span className={`font-medium ${trendColor}`}>{trend}</span>
          <span className="opacity-70">vs mois dernier</span>
        </p>
      </CardContent>
    </Card>
  );
}
