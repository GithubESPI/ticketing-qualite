import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { JiraIssue } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AnalyticsTableProps {
  issues: JiraIssue[];
}

export default function AnalyticsTable({ issues }: AnalyticsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  const itemsPerPage = 10;

  // Filter by search term
  const filteredIssues = issues.filter(issue => 
    issue.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.fields.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.fields.assignee?.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.fields.status?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort issues
  const sortedIssues = React.useMemo(() => {
    let sortableItems = [...filteredIssues];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // @ts-ignore
        let aValue = getNestedValue(a, sortConfig.key);
        // @ts-ignore
        let bValue = getNestedValue(b, sortConfig.key);

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredIssues, sortConfig]);

  const totalPages = Math.ceil(sortedIssues.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentIssues = sortedIssues.slice(startIndex, startIndex + itemsPerPage);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 ml-1 text-slate-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUpDown className="w-3 h-3 ml-1 text-blue-600 rotate-180" /> 
      : <ArrowUpDown className="w-3 h-3 ml-1 text-blue-600" />;
  };

  return (
    <div className="space-y-4 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Détails des Issues</h3>
          <p className="text-sm text-slate-500">Liste détaillée des tickets filtrés</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Rechercher (Clé, Résumé, Statut...)"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="rounded-md border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[100px] cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('key')}>
                <div className="flex items-center">Clé {getSortIcon('key')}</div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('fields.summary')}>
                <div className="flex items-center">Résumé {getSortIcon('fields.summary')}</div>
              </TableHead>
              <TableHead className="w-[140px] cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('fields.status.name')}>
                <div className="flex items-center">Statut {getSortIcon('fields.status.name')}</div>
              </TableHead>
              <TableHead className="w-[120px] cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('fields.priority.name')}>
                <div className="flex items-center">Priorité {getSortIcon('fields.priority.name')}</div>
              </TableHead>
              <TableHead className="w-[180px] cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('fields.assignee.displayName')}>
                <div className="flex items-center">Assigné à {getSortIcon('fields.assignee.displayName')}</div>
              </TableHead>
              <TableHead className="w-[120px] cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('fields.created')}>
                <div className="flex items-center">Créé le {getSortIcon('fields.created')}</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentIssues.length > 0 ? (
              currentIssues.map((issue) => (
                <TableRow key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-blue-600 font-mono text-xs">
                    {issue.key}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate text-slate-700 font-medium" title={issue.fields.summary}>
                    {issue.fields.summary}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-normal">
                      {issue.fields.status?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(issue.fields.priority?.name)}
                      <span className="text-sm text-slate-600">{issue.fields.priority?.name || 'N/A'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {getInitials(issue.fields.assignee?.displayName)}
                      </div>
                      <span className="text-sm text-slate-600 truncate max-w-[120px]" title={issue.fields.assignee?.displayName}>
                        {issue.fields.assignee?.displayName || 'Non assigné'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 text-xs">
                    {format(new Date(issue.fields.created), 'dd/MM/yyyy', { locale: fr })}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                  Aucun résultat trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-slate-500">
          Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, sortedIssues.length)} sur {sortedIssues.length} issues
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium text-slate-700">
            Page {currentPage} sur {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getPriorityIcon(priority?: string) {
  if (!priority) return null;
  const p = priority.toLowerCase();
  if (p.includes('high') || p.includes('haute') || p.includes('critique') || p.includes('major')) {
    return <div className="w-2 h-2 rounded-full bg-red-500" />;
  }
  if (p.includes('medium') || p.includes('moyenne')) {
    return <div className="w-2 h-2 rounded-full bg-orange-500" />;
  }
  return <div className="w-2 h-2 rounded-full bg-green-500" />;
}
