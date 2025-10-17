// API route pour récupérer les projets Jira
import { NextRequest, NextResponse } from 'next/server';
import { getProjects, getProjectDetails, getProjectIssues } from '../jira/projects';

// GET /api/projects - Récupérer tous les projets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectKey = searchParams.get('key');
    const action = searchParams.get('action');
    const maxResults = parseInt(searchParams.get('maxResults') || '50');

    // Si un projet spécifique est demandé
    if (projectKey && action === 'details') {
      const result = await getProjectDetails(projectKey);
      return NextResponse.json(result);
    }

    // Si les issues d'un projet sont demandés
    if (projectKey && action === 'issues') {
      const result = await getProjectIssues(projectKey, maxResults);
      return NextResponse.json(result);
    }

    // Par défaut, récupérer tous les projets
    const result = await getProjects();
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Erreur API route projets:', error.message);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
