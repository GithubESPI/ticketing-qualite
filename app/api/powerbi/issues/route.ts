import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '../../axiosInstance';
import { isAuthenticated } from '@/lib/auth-utils';

// Fonction pour extraire le texte des documents Jira structurés
function extractTextFromJiraDoc(doc: any): string {
  if (!doc || typeof doc !== 'object') return '';
  
  if (doc.content && Array.isArray(doc.content)) {
    return doc.content
      .map((item: any) => {
        if (item.type === 'paragraph' && item.content) {
          return item.content
            .map((textItem: any) => textItem.text || '')
            .join('');
        }
        return '';
      })
      .join(' ')
      .trim();
  }
  
  return '';
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authenticated = await isAuthenticated(request);
    if (!authenticated) {
      return NextResponse.json(
        { error: 'Non autorisé. Authentification requise.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const maxResults = parseInt(searchParams.get('maxResults') || '100');

    console.log('🔍 Récupération des issues depuis Jira...');

    // 1. Récupérer les issues depuis Jira avec la nouvelle API
    const issuesResponse = await axiosInstance.get('/rest/api/3/search/jql', {
      params: {
        jql: 'project = DYS',
        maxResults: maxResults,
        fields: 'summary,status,priority,assignee,reporter,created,updated,description,issuetype,project,customfield_10117,customfield_10118,customfield_10132,customfield_10121,customfield_10122,customfield_10116,customfield_10120,customfield_10131,customfield_10130'
      }
    });

    const issuesData = issuesResponse.data.issues || [];
    console.log(`✅ ${issuesData.length} issues récupérés depuis Jira`);
    
    // Debug: Afficher la structure des données pour comprendre les champs disponibles
    if (issuesData.length > 0) {
      console.log('🔍 Structure des données Jira Issues:');
      console.log('Champs disponibles:', Object.keys(issuesData[0].fields || {}));
      console.log('Exemple de données:', JSON.stringify(issuesData[0], null, 2));
    }

    // 2. Mapper les données Jira vers le format standard
    const mappedIssues = issuesData.map((issue: any) => {
      console.log(`🔍 Issue ${issue.key} - Mapping:`, {
        key: issue.key,
        summary: issue.fields.summary,
        customFields: Object.keys(issue.fields).filter(key => key.startsWith('customfield_'))
      });

      return {
        id: issue.id,
        key: issue.key,
        fields: {
          summary: issue.fields.summary || 'Issue Jira',
          status: issue.fields.status || { name: 'Inconnu' },
          priority: issue.fields.priority || { name: 'Normal' },
          assignee: issue.fields.assignee || null,
          reporter: issue.fields.reporter || null,
          created: issue.fields.created || new Date().toISOString(),
          updated: issue.fields.updated || new Date().toISOString(),
          description: extractTextFromJiraDoc(issue.fields.description) || 'Description depuis Jira',
          issuetype: issue.fields.issuetype || { name: 'Task', iconUrl: '/jira-task-icon.png' },
          project: issue.fields.project || { key: 'DYS', name: 'Ticketing Qualité' },
          // Champs personnalisés récupérés directement depuis Jira
          customfield_10001: 'Non défini', // Action clôturée - non disponible
          customfield_10002: 'Non défini', // Action corrective - non disponible  
          customfield_10003: 'Non défini', // Action curative - non disponible
          customfield_10004: 'Non défini', // Date de constatation - non disponible
          customfield_10005: 'Non défini', // Date effective de réalisation - non disponible
          customfield_10006: 'Non défini', // Efficacité de l'action - non disponible
          customfield_10007: Array.isArray(issue.fields.customfield_10117) 
            ? issue.fields.customfield_10117[0]?.value || 'Non défini'
            : issue.fields.customfield_10117?.value || 'Non défini', // Entité Origine (Campus)
          customfield_10008: issue.fields.customfield_10118?.value || issue.fields.customfield_10132?.value || 'Non défini', // Processus
          // Nouveaux champs personnalisés
          customfield_10117: Array.isArray(issue.fields.customfield_10117) 
            ? issue.fields.customfield_10117[0]?.value || 'Non défini'
            : issue.fields.customfield_10117?.value || issue.fields.customfield_10117 || 'Non défini', // Campus/Entité Origine
          customfield_10118: issue.fields.customfield_10118?.value || issue.fields.customfield_10118 || 'Non défini', // Processus PR7
          customfield_10132: issue.fields.customfield_10132?.value || issue.fields.customfield_10132 || 'Non défini', // Processus détaillé
          customfield_10121: issue.fields.customfield_10121?.value || issue.fields.customfield_10121 || 'Non défini', // Type d'utilisateur
          customfield_10122: extractTextFromJiraDoc(issue.fields.customfield_10122) || 'Non défini', // Action curative (description)
          customfield_10116: extractTextFromJiraDoc(issue.fields.customfield_10116) || 'Non défini', // Description du problème
          customfield_10120: issue.fields.customfield_10120 || 'Non défini', // Date de constatation
          customfield_10131: issue.fields.customfield_10131?.value || issue.fields.customfield_10131 || 'Non défini', // Champ personnalisé supplémentaire
          customfield_10130: issue.fields.customfield_10130?.value || issue.fields.customfield_10130 || 'Non défini' // Champ personnalisé supplémentaire
        }
      };
    });

    console.log(`📊 ${mappedIssues.length} issues mappés depuis Jira`);

    // 3. Analyser les champs utilisés
    const usedCustomFields = new Set();
    mappedIssues.forEach((issue: any) => {
      Object.keys(issue.fields).forEach(fieldKey => {
        if (fieldKey.startsWith('customfield_') && issue.fields[fieldKey] !== 'Non défini') {
          usedCustomFields.add(fieldKey);
        }
      });
    });

    console.log(`🔍 Champs personnalisés utilisés: ${Array.from(usedCustomFields).join(', ')}`);

    return NextResponse.json({
      success: true,
      issues: mappedIssues,
      source: 'Jira API avec champs personnalisés',
      usedCustomFields: Array.from(usedCustomFields),
      totalIssues: mappedIssues.length,
      jiraIssues: issuesData.length
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des issues Jira:', error.response?.data || error.message);
    
    return NextResponse.json({
      success: false,
      error: error.response?.data?.errorMessages?.[0] || error.message || 'Erreur lors de la récupération des issues Jira',
      source: 'Jira API'
    }, { status: 500 });
  }
}
