// Script de test pour les endpoints Jira
const axios = require('axios');

// Configuration de test
const JIRA_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_JIRA_BASE_URL || 'https://votreentreprise.atlassian.net',
  email: process.env.NEXT_PUBLIC_JIRA_EMAIL || 'votre-email@exemple.com',
  apiToken: process.env.NEXT_PUBLIC_JIRA_API_TOKEN || 'votre-token-api-jira'
};

console.log('🧪 Test des endpoints Jira...');
console.log('📧 Email:', JIRA_CONFIG.email);
console.log('🔗 Base URL:', JIRA_CONFIG.baseURL);
console.log('🔑 Token:', JIRA_CONFIG.apiToken.substring(0, 10) + '...');

// Créer l'instance Axios
const axiosInstance = axios.create({
  baseURL: JIRA_CONFIG.baseURL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Ajouter l'authentification
const credentials = Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`).toString('base64');
axiosInstance.defaults.headers.Authorization = `Basic ${credentials}`;

// Test 1: Récupération des projets
async function testProjects() {
  try {
    console.log('\n📋 Test 1: Récupération des projets...');
    const response = await axiosInstance.get('/rest/api/3/project');
    console.log('✅ Projets récupérés:', {
      count: response.data.length,
      projects: response.data.map(p => ({
        key: p.key,
        name: p.name,
        type: p.projectTypeKey
      }))
    });
    return true;
  } catch (error) {
    console.error('❌ Erreur projets:', error.response?.status, error.response?.statusText);
    return false;
  }
}

// Test 2: Informations utilisateur
async function testUser() {
  try {
    console.log('\n👤 Test 2: Informations utilisateur...');
    const response = await axiosInstance.get('/rest/api/3/myself');
    console.log('✅ Utilisateur récupéré:', {
      accountId: response.data.accountId,
      displayName: response.data.displayName,
      emailAddress: response.data.emailAddress
    });
    return true;
  } catch (error) {
    console.error('❌ Erreur utilisateur:', error.response?.status, error.response?.statusText);
    return false;
  }
}

// Test 3: Recherche d'issues
async function testIssues() {
  try {
    console.log('\n🔍 Test 3: Recherche d\'issues...');
    const response = await axiosInstance.post('/rest/api/3/search', {
      jql: 'ORDER BY created DESC',
      maxResults: 5,
      fields: ['summary', 'status', 'priority', 'assignee', 'created']
    });
    console.log('✅ Issues trouvés:', {
      total: response.data.total,
      count: response.data.issues.length,
      issues: response.data.issues.map(issue => ({
        key: issue.key,
        summary: issue.fields.summary,
        status: issue.fields.status.name
      }))
    });
    return true;
  } catch (error) {
    console.error('❌ Erreur issues:', error.response?.status, error.response?.statusText);
    return false;
  }
}

// Lancer tous les tests
async function runAllTests() {
  console.log('🚀 Début des tests...\n');
  
  const results = {
    projects: await testProjects(),
    user: await testUser(),
    issues: await testIssues()
  };
  
  console.log('\n📊 Résultats des tests:');
  console.log('Projets:', results.projects ? '✅' : '❌');
  console.log('Utilisateur:', results.user ? '✅' : '❌');
  console.log('Issues:', results.issues ? '✅' : '❌');
  
  const successCount = Object.values(results).filter(Boolean).length;
  console.log(`\n🎯 ${successCount}/3 tests réussis`);
  
  if (successCount === 3) {
    console.log('🎉 Tous les tests ont réussi ! L\'API Jira fonctionne correctement.');
  } else {
    console.log('⚠️ Certains tests ont échoué. Vérifiez votre configuration.');
  }
}

// Exécuter les tests
runAllTests().catch(console.error);
