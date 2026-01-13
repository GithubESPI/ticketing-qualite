export interface JiraIssue {
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

export interface AnalyticsState {
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
  showMobileSidebar: boolean;
  showDesktopSidebar: boolean;
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
