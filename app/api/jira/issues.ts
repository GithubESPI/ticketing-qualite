import axiosInstance from '../axiosInstance';

// Interface pour un issue Jira
export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    status: {
      id: string;
      name: string;
      statusCategory: {
        id: number;
        key: string;
        colorName: string;
        name: string;
      };
    };
    priority: {
      id: string;
      name: string;
      iconUrl: string;
    };
    assignee?: {
      accountId: string;
      displayName: string;
      emailAddress?: string;
      avatarUrls: {
        '16x16': string;
        '24x24': string;
        '32x32': string;
        '48x48': string;
      };
    };
    reporter: {
      accountId: string;
      displayName: string;
      emailAddress?: string;
      avatarUrls: {
        '16x16': string;
        '24x24': string;
        '32x32': string;
        '48x48': string;
      };
    };
    created: string;
    updated: string;
    description?: string;
    issuetype: {
      id: string;
      name: string;
      iconUrl: string;
    };
    project: {
      id: string;
      key: string;
      name: string;
    };
  };
}

// Interface pour la réponse des issues
export interface IssuesResponse {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
}

// Interface pour les paramètres de recherche
export interface SearchParams {
  jql?: string;
  startAt?: number;
  maxResults?: number;
  fields?: string[];
  expand?: string[];
}

/**
 * Recherche des issues Jira avec JQL
 */
export const searchIssues = async (params: SearchParams = {}): Promise<IssuesResponse> => {
  try {
    const defaultParams: SearchParams = {
      jql: 'ORDER BY created DESC',
      startAt: 0,
      maxResults: 50,
      fields: ['summary', 'status', 'priority', 'assignee', 'reporter', 'created', 'updated', 'description', 'issuetype', 'project'],
      expand: ['changelog']
    };

    const searchParams = { ...defaultParams, ...params };
    
    console.log('🔍 Recherche des issues Jira:', searchParams);
    
    // Utiliser la nouvelle API /rest/api/3/search/jql
    const response = await axiosInstance.get<IssuesResponse>('/rest/api/3/search/jql', {
      params: {
        jql: searchParams.jql,
        startAt: searchParams.startAt,
        maxResults: searchParams.maxResults,
        fields: searchParams.fields?.join(','),
        expand: searchParams.expand?.join(',')
      }
    });
    
    console.log('✅ Issues trouvés:', {
      total: response.data.total,
      count: response.data.issues.length,
      issues: response.data.issues.map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name,
        priority: issue.fields.priority.name
      }))
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la recherche des issues:', error);
    throw error;
  }
};

/**
 * Récupère un issue spécifique par sa clé
 */
export const getIssue = async (issueKey: string): Promise<JiraIssue> => {
  try {
    console.log(`📋 Récupération de l'issue: ${issueKey}`);
    
    const response = await axiosInstance.get<JiraIssue>(`/rest/api/3/issue/${issueKey}`);
    
    console.log('✅ Issue récupéré:', {
      key: response.data.key,
      summary: response.data.fields.summary,
      status: response.data.fields.status.name
    });
    
    return response.data;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération de l'issue ${issueKey}:`, error);
    throw error;
  }
};

/**
 * Récupère les issues d'un projet spécifique
 */
export const getProjectIssues = async (projectKey: string, maxResults: number = 50): Promise<IssuesResponse> => {
  try {
    console.log(`📋 Récupération des issues du projet: ${projectKey}`);
    
    const jql = `project = "${projectKey}" ORDER BY created DESC`;
    
    return await searchIssues({
      jql,
      maxResults
    });
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des issues du projet ${projectKey}:`, error);
    throw error;
  }
};
