import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '../../axiosInstance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectKey = searchParams.get('projectKey') || 'DYS';
    const maxResults = parseInt(searchParams.get('maxResults') || '100');

    console.log(`🔍 Récupération des issues du projet ${projectKey} avec tous les champs personnalisés...`);

    // Récupérer tous les champs disponibles pour identifier les champs personnalisés
    const fieldsResponse = await axiosInstance.get('/rest/api/3/field/search');
    const allFields = fieldsResponse.data;
    const customFields = allFields.filter((field: any) => field.custom === true);
    
    console.log(`📋 ${customFields.length} champs personnalisés identifiés`);

    // Construire la liste des champs à récupérer
    const fieldsToFetch = [
      'summary',
      'status',
      'priority',
      'assignee',
      'reporter',
      'created',
      'updated',
      'description',
      'issuetype',
      'project',
      // Ajouter tous les champs personnalisés
      ...customFields.map((field: any) => field.id)
    ];

    console.log(`🔧 Champs à récupérer: ${fieldsToFetch.length} (${fieldsToFetch.slice(0, 10).join(', ')}...)`);

    // Récupérer les issues avec tous les champs
    const issuesResponse = await axiosInstance.get('/rest/api/3/search', {
      params: {
        jql: `project = "${projectKey}" ORDER BY created DESC`,
        maxResults: maxResults,
        fields: fieldsToFetch.join(','),
        expand: 'changelog'
      }
    });

    const issues = issuesResponse.data.issues || [];
    console.log(`✅ ${issues.length} issues récupérés avec tous les champs`);

    // Analyser les champs personnalisés utilisés
    const usedCustomFields = new Set();
    issues.forEach((issue: any) => {
      Object.keys(issue.fields).forEach(fieldKey => {
        if (fieldKey.startsWith('customfield_') && issue.fields[fieldKey] !== null && issue.fields[fieldKey] !== undefined) {
          usedCustomFields.add(fieldKey);
        }
      });
    });

    console.log(`📊 Champs personnalisés utilisés: ${Array.from(usedCustomFields).join(', ')}`);

    return NextResponse.json({
      success: true,
      issues: issues,
      source: 'Jira API avec tous les champs personnalisés',
      usedCustomFields: Array.from(usedCustomFields),
      customFieldsAvailable: customFields.length,
      totalIssues: issues.length
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de la récupération des issues avec champs personnalisés:', error.response?.data || error.message);
    
    return NextResponse.json({
      success: false,
      error: error.response?.data?.errorMessages?.[0] || error.message || 'Erreur lors de la récupération des issues',
      source: 'Jira API'
    }, { status: 500 });
  }
}
