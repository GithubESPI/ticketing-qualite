// Test de l'API Jira officielle avec authentification Basic
const axios = require('axios');

// Configuration avec authentification Basic
const JIRA_CONFIG = {
  baseUrl: 'https://groupe-espi.atlassian.net',
  email: 'informatique@groupe-espi.fr',
  // Vous devez générer un vrai token API Jira ici
  apiToken: 'VOTRE_TOKEN_API_JIRA_ICI' // Remplacez par votre vrai token API Jira
};

console.log('🧪 Test de l\'API Jira officielle avec authentification Basic...');
console.log('📧 Email:', JIRA_CONFIG.email);
console.log('🔗 Base URL:', JIRA_CONFIG.baseUrl);
console.log('🔑 Token:', JIRA_CONFIG.apiToken.substring(0, 10) + '...');

async function testJiraOfficial() {
  try {
    console.log('\n🔗 Test 1: Informations utilisateur (/rest/api/3/myself)');
    
    const response = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Connexion réussie !');
    console.log('👤 Utilisateur:', response.data.displayName);
    console.log('📧 Email:', response.data.emailAddress);
    console.log('🆔 Account ID:', response.data.accountId);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    if (error.response?.status === 401) {
      console.error('\n🔐 Problème d\'authentification:');
      console.error('1. Vérifiez que votre email est correct');
      console.error('2. Générez un nouveau token API Jira sur: https://id.atlassian.com/manage/api-tokens');
      console.error('3. Assurez-vous d\'utiliser le token API Jira, pas le token PowerBI');
    }
    
    return false;
  }
}

async function testProjects() {
  try {
    console.log('\n🔗 Test 2: Liste des projets (/rest/api/3/project)');
    
    const response = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/project`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Projets récupérés:', response.data.length);
    response.data.forEach(project => {
      console.log(`  - ${project.key}: ${project.name} (${project.projectTypeKey})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erreur projets:', error.response?.status, error.response?.statusText);
    return false;
  }
}

async function testIssues() {
  try {
    console.log('\n🔗 Test 3: Recherche d\'issues (/rest/api/3/search)');
    
    const response = await axios.post(`${JIRA_CONFIG.baseUrl}/rest/api/3/search`, {
      jql: 'ORDER BY created DESC',
      maxResults: 5,
      fields: ['summary', 'status', 'priority', 'assignee', 'created']
    }, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.apiToken}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Issues trouvés:', response.data.total);
    response.data.issues.forEach(issue => {
      console.log(`  - ${issue.key}: ${issue.fields.summary} (${issue.fields.status.name})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Erreur issues:', error.response?.status, error.response?.statusText);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Début des tests avec l\'API Jira officielle...\n');
  
  if (JIRA_CONFIG.apiToken === 'VOTRE_TOKEN_API_JIRA_ICI') {
    console.log('⚠️ ATTENTION: Vous devez d\'abord générer un token API Jira !');
    console.log('1. Allez sur: https://id.atlassian.com/manage/api-tokens');
    console.log('2. Créez un nouveau token');
    console.log('3. Remplacez "VOTRE_TOKEN_API_JIRA_ICI" par votre vrai token');
    console.log('4. Relancez ce script\n');
    return;
  }
  
  const user = await testJiraOfficial();
  if (!user) {
    console.log('\n❌ Impossible de se connecter. Vérifiez vos credentials.');
    return;
  }
  
  const projects = await testProjects();
  const issues = await testIssues();
  
  console.log('\n📊 Résultats:');
  console.log('Utilisateur:', user ? '✅' : '❌');
  console.log('Projets:', projects ? '✅' : '❌');
  console.log('Issues:', issues ? '✅' : '❌');
  
  const successCount = [user, projects, issues].filter(Boolean).length;
  console.log(`\n🎯 ${successCount}/3 tests réussis`);
  
  if (successCount === 3) {
    console.log('🎉 L\'API Jira officielle fonctionne parfaitement !');
    console.log('Vous pouvez maintenant configurer votre application avec ces credentials.');
  }
}

runTests().catch(console.error);
