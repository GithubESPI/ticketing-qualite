import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  ResponsiveContainer
} from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart3, PieChart as PieChartIcon, Activity, TrendingUp, Users } from 'lucide-react';

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#6366f1'];

interface AnalyticsChartsProps {
  dataByStatus: any[];
  dataByPriority: any[];
  dataByMonth: any[];
  dataByCampus: any[];
  dataByProcessus: any[];
  dataByUserType: any[];
}

export default function AnalyticsCharts({
  dataByStatus,
  dataByPriority,
  dataByMonth,
  dataByCampus,
  dataByProcessus,
  dataByUserType
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique en barres - Issues par statut */}
      <ChartCard
        title="Issues par Statut"
        description="Répartition des issues selon leur statut"
        icon={BarChart3}
        iconColor="text-blue-600"
      >
        <BarChart data={dataByStatus} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="status" 
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
            width={30} 
          />
          <ChartTooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltipContent />} />
          <Bar 
            dataKey="count" 
            fill="var(--color-count)" 
            radius={[4, 4, 0, 0]}
            barSize={32}
          />
        </BarChart>
      </ChartCard>

      {/* Graphique en secteurs - Issues par priorité */}
      <ChartCard
        title="Issues par Priorité"
        description="Distribution des issues par niveau de priorité"
        icon={PieChartIcon}
        iconColor="text-emerald-600"
      >
        <PieChart>
          <Pie
            data={dataByPriority}
            cx="50%"
            cy="50%"
            outerRadius="70%"
            innerRadius="50%"
            dataKey="count"
            paddingAngle={4}
          >
            {dataByPriority.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend data={dataByPriority} colorKey="priority" />
        </PieChart>
      </ChartCard>

      {/* Graphique en secteurs - Issues par Processus */}
      <ChartCard
        title="Issues par Processus"
        description="Distribution des issues par processus"
        icon={Activity}
        iconColor="text-violet-600"
      >
        <PieChart>
          <Pie
            data={dataByProcessus}
            cx="50%"
            cy="50%"
            outerRadius="70%"
            innerRadius="0"
            dataKey="count"
            paddingAngle={2}
          >
            {dataByProcessus.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={1} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend data={dataByProcessus} colorKey="processus" />
        </PieChart>
      </ChartCard>

      {/* Graphique linéaire - Évolution temporelle */}
      <ChartCard
        title="Évolution Temporelle"
        description="Création d'issues au fil du temps"
        icon={TrendingUp}
        iconColor="text-amber-600"
      >
        <LineChart data={dataByMonth} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
            width={30} 
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: 'white', stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
          />
        </LineChart>
      </ChartCard>

      {/* Graphique en barres - Issues par Campus */}
      <ChartCard
        title="Issues par Campus"
        description="Répartition des issues par campus"
        icon={Users}
        iconColor="text-indigo-600"
      >
        <BarChart data={dataByCampus} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="campus" 
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 11, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
            width={30} 
          />
          <ChartTooltip cursor={{ fill: '#f1f5f9' }} content={<ChartTooltipContent />} />
          <Bar 
            dataKey="count" 
            fill="#6366f1" 
            radius={[4, 4, 0, 0]}
            barSize={32}
          />
        </BarChart>
      </ChartCard>

      {/* Graphique en secteurs - Issues par Type d'utilisateur */}
      <ChartCard
        title="Issues par Type d'utilisateur"
        description="Distribution des issues par type d'utilisateur"
        icon={Users}
        iconColor="text-rose-600"
      >
        <PieChart>
          <Pie
            data={dataByUserType}
            cx="50%"
            cy="50%"
            outerRadius="70%"
            innerRadius="40%"
            dataKey="count"
            paddingAngle={4}
          >
            {dataByUserType.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={2} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend data={dataByUserType} colorKey="userType" />
        </PieChart>
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, description, icon: Icon, iconColor, children }: any) {
  return (
    <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <CardHeader className="pb-2 border-b border-slate-50 bg-slate-50/50">
         <CardTitle className="flex items-center gap-2 text-slate-800 text-base">
           <div className={`p-1.5 rounded-md bg-white shadow-sm ${iconColor}`}>
             <Icon className="w-4 h-4" />
           </div>
           {title}
         </CardTitle>
        <CardDescription className="text-slate-500 text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-6">
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Custom Legend for Pie Charts
function Legend({ data, colorKey }: any) {
  if (!data || data.length === 0) return null;
  
  // Take top 4 items to avoid clutter
  const items = data.slice(0, 4);
  
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs text-slate-600">
      {items.map((item: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5">
          <div 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
          />
          <span>{item[colorKey]} ({item.count})</span>
        </div>
      ))}
    </div>
  );
}
