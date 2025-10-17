// Types globaux pour l'application

export interface Ticket {
  id: string;
  summary: string;
  status: string;
  priority: string;
  assignee: string;
  created: string;
  description?: string;
  key?: string;
  title?: string;
  assigned_to?: string;
  created_date?: string;
}

export interface TicketStats {
  total: number;
  enCours: number;
  termines: number;
}

export interface FilterOption {
  key: string;
  label: string;
  icon: any;
  color: string;
}

export type FilterType = 'all' | 'cours' | 'terminé' | 'nouveau';

export interface ApiResponse {
  value?: Ticket[];
  d?: {
    results: Ticket[];
  };
  [key: string]: any;
}
