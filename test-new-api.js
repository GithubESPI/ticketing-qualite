// Test de la nouvelle API /rest/api/3/search/jql
const axios = require('axios');

const JIRA_CONFIG = {
  baseUrl: 'https://groupe-espi.atlassian.net',
  email: 'informatique@groupe-espi.fr',
  token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
};

console.log('🧪 Test de la nouvelle API /rest/api/3/search/jql...');
console.log('📧 Email:', JIRA_CONFIG.email);
console.log('🔗 Base URL:', JIRA_CONFIG.baseUrl);

async function testNewSearchAPI() {
  try {
    console.log('\n🔗 Test 1: Nouvelle API /rest/api/3/search/jql');
    
    const response = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/search/jql`, {
      params: {
        jql: 'project = "DYS" ORDER BY created DESC',
        maxResults: 10,
        fields: 'key,summary,status,priority,assignee,created,updated'
      },
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Nouvelle API fonctionne !');
    console.log('Status:', response.status);
    console.log('Total issues:', response.data.total);
    console.log('Issues récupérés:', response.data.issues?.length || 0);
    
    if (response.data.issues && response.data.issues.length > 0) {
      console.log('\n📋 Issues trouvés:');
      response.data.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.key}: ${issue.fields.summary} (${issue.fields.status.name})`);
      });
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erreur nouvelle API:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    if (error.response?.data) {
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

async function testOldSearchAPI() {
  try {
    console.log('\n🔗 Test 2: Ancienne API /rest/api/3/search (pour comparaison)');
    
    const response = await axios.post(`${JIRA_CONFIG.baseUrl}/rest/api/3/search`, {
      jql: 'project = "DYS" ORDER BY created DESC',
      maxResults: 10,
      fields: ['key', 'summary', 'status', 'priority', 'assignee', 'created', 'updated']
    }, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Ancienne API fonctionne encore !');
    console.log('Status:', response.status);
    console.log('Total issues:', response.data.total);
    console.log('Issues récupérés:', response.data.issues?.length || 0);
    
    return true;
  } catch (error) {
    console.error('❌ Ancienne API échouée (attendu):');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    return false;
  }
}

async function testProjectDetails() {
  try {
    console.log('\n🔗 Test 3: Détails du projet DYS');
    
    const response = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/project/DYS`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Projet DYS récupéré !');
    console.log('Key:', response.data.key);
    console.log('Name:', response.data.name);
    console.log('Type:', response.data.projectTypeKey);
    console.log('Description:', response.data.description);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur projet DYS:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    return false;
  }
}

async function runTests() {
  console.log('🚀 Début des tests de la nouvelle API...\n');
  
  const newAPI = await testNewSearchAPI();
  const oldAPI = await testOldSearchAPI();
  const project = await testProjectDetails();
  
  console.log('\n📊 Résultats des tests:');
  console.log('Nouvelle API /search/jql:', newAPI ? '✅' : '❌');
  console.log('Ancienne API /search:', oldAPI ? '✅' : '❌');
  console.log('Projet DYS:', project ? '✅' : '❌');
  
  const successCount = [newAPI, project].filter(Boolean).length;
  console.log(`\n🎯 ${successCount}/2 tests réussis`);
  
  if (newAPI && project) {
    console.log('🎉 La nouvelle API fonctionne parfaitement !');
    console.log('L\'application peut maintenant récupérer les issues du projet DYS.');
  } else {
    console.log('⚠️ Problème avec la nouvelle API ou le projet DYS.');
  }
}

runTests().catch(console.error);
