// Export centralisé de tous les endpoints Jira
export * from './projects';
export { getIssue, searchIssues } from './issues';

// Fonction utilitaire pour tester la connexion Jira
export const testJiraConnection = async (): Promise<boolean> => {
  try {
    console.log('🧪 Test de connexion à Jira...');
    
    // Test simple avec la récupération des projets
    const { getProjects } = await import('./projects');
    const { projects } = await getProjects();
    
    console.log('✅ Connexion Jira réussie:', {
      projectsCount: projects?.length ?? 0,
      firstProject: projects?.[0]?.name
    });
    
    return true;
  } catch (error) {
    console.error('❌ Échec de la connexion Jira:', error);
    return false;
  }
};

// Fonction pour obtenir les informations de l'utilisateur connecté
export const getCurrentUser = async () => {
  try {
    console.log('👤 Récupération de l\'utilisateur actuel...');
    
    const axiosInstance = (await import('../axiosInstance')).default;
    const response = await axiosInstance.get('/rest/api/3/myself');
    
    console.log('✅ Utilisateur récupéré:', {
      accountId: response.data.accountId,
      displayName: response.data.displayName,
      emailAddress: response.data.emailAddress
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
};
