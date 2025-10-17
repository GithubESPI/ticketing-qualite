// Script de test avec credentials personnalisés
const axios = require('axios');

// Configuration avec vos vraies credentials
const CUSTOM_CONFIG = {
  baseURL: 'https://groupe-espi.atlassian.net',
  email: 'informatique@groupe-espi.fr',
  apiToken: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
};

console.log('🧪 Test avec credentials personnalisés...');
console.log('📧 Email:', CUSTOM_CONFIG.email);
console.log('🔗 Base URL:', CUSTOM_CONFIG.baseURL);
console.log('🔑 Token:', CUSTOM_CONFIG.apiToken.substring(0, 10) + '...');

// Créer l'instance Axios
const axiosInstance = axios.create({
  baseURL: CUSTOM_CONFIG.baseURL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Ajouter l'authentification
const credentials = Buffer.from(`${CUSTOM_CONFIG.email}:${CUSTOM_CONFIG.apiToken}`).toString('base64');
axiosInstance.defaults.headers.Authorization = `Basic ${credentials}`;

// Test de connexion simple
async function testConnection() {
  try {
    console.log('\n🔗 Test de connexion...');
    const response = await axiosInstance.get('/rest/api/3/myself');
    console.log('✅ Connexion réussie !');
    console.log('👤 Utilisateur:', response.data.displayName);
    console.log('📧 Email:', response.data.emailAddress);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    if (error.response?.status === 401) {
      console.error('🔐 Problème d\'authentification - Vérifiez votre email et token');
    } else if (error.response?.status === 404) {
      console.error('🔗 URL incorrecte - Vérifiez votre baseURL');
    } else if (error.response?.status === 403) {
      console.error('🚫 Accès interdit - Vérifiez vos permissions');
    }
    
    return false;
  }
}

// Test des projets
async function testProjects() {
  try {
    console.log('\n📋 Test des projets...');
    const response = await axiosInstance.get('/rest/api/3/project');
    console.log('✅ Projets récupérés:', response.data.length);
    response.data.slice(0, 3).forEach(project => {
      console.log(`  - ${project.key}: ${project.name}`);
    });
    return true;
  } catch (error) {
    console.error('❌ Erreur projets:', error.response?.status, error.response?.statusText);
    return false;
  }
}

// Test des issues
async function testIssues() {
  try {
    console.log('\n🔍 Test des issues...');
    const response = await axiosInstance.post('/rest/api/3/search', {
      jql: 'ORDER BY created DESC',
      maxResults: 3,
      fields: ['summary', 'status', 'priority']
    });
    console.log('✅ Issues trouvés:', response.data.total);
    response.data.issues.forEach(issue => {
      console.log(`  - ${issue.key}: ${issue.fields.summary}`);
    });
    return true;
  } catch (error) {
    console.error('❌ Erreur issues:', error.response?.status, error.response?.statusText);
    return false;
  }
}

// Lancer les tests
async function runTests() {
  console.log('🚀 Début des tests avec credentials personnalisés...\n');
  
  const connection = await testConnection();
  if (!connection) {
    console.log('\n❌ Impossible de se connecter. Vérifiez vos credentials.');
    return;
  }
  
  const projects = await testProjects();
  const issues = await testIssues();
  
  console.log('\n📊 Résultats:');
  console.log('Connexion:', connection ? '✅' : '❌');
  console.log('Projets:', projects ? '✅' : '❌');
  console.log('Issues:', issues ? '✅' : '❌');
  
  if (connection && projects && issues) {
    console.log('\n🎉 Tous les tests ont réussi ! Votre API Jira fonctionne parfaitement.');
  }
}

// Instructions
console.log('📝 INSTRUCTIONS:');
console.log('1. Modifiez les valeurs dans CUSTOM_CONFIG avec vos vraies credentials');
console.log('2. Relancez le script: node test-with-credentials.js');
console.log('3. Si les tests réussissent, vous pouvez configurer votre application\n');

// Exécuter les tests
runTests().catch(console.error);
