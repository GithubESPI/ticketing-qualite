// Test des endpoints Jira avec votre base URL
const axios = require('axios');

const JIRA_CONFIG = {
  baseUrl: 'https://groupe-espi.atlassian.net',
  email: 'informatique@groupe-espi.fr',
  token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
};

console.log('🧪 Test des endpoints Jira...');
console.log('📧 Email:', JIRA_CONFIG.email);
console.log('🔗 Base URL:', JIRA_CONFIG.baseUrl);
console.log('🔑 Token:', JIRA_CONFIG.token.substring(0, 20) + '...');

async function testEndpoint(url, name) {
  try {
    console.log(`\n🔗 Test: ${name}`);
    console.log('URL:', url);
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log(`✅ ${name} - Status: ${response.status}`);
    console.log('Data keys:', Object.keys(response.data || {}));
    
    if (response.data && typeof response.data === 'object') {
      console.log('Sample data:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ ${name} - ${error.response?.status || error.message}`);
    if (error.response?.data) {
      console.log('Error data:', JSON.stringify(error.response.data, null, 2).substring(0, 200) + '...');
    }
    return false;
  }
}

async function testAllEndpoints() {
  const endpoints = [
    {
      url: `${JIRA_CONFIG.baseUrl}/rest/api/3/myself`,
      name: 'Informations utilisateur'
    },
    {
      url: `${JIRA_CONFIG.baseUrl}/rest/api/3/project`,
      name: 'Liste des projets'
    },
    {
      url: `${JIRA_CONFIG.baseUrl}/rest/api/3/search`,
      name: 'Recherche d\'issues (GET)',
      method: 'GET'
    }
  ];
  
  console.log('🚀 Début des tests...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint.url, endpoint.name);
    results.push({ name: endpoint.name, success: result });
  }
  
  // Test de recherche d'issues avec POST
  try {
    console.log('\n🔗 Test: Recherche d\'issues (POST)');
    const searchUrl = `${JIRA_CONFIG.baseUrl}/rest/api/3/search`;
    console.log('URL:', searchUrl);
    
    const response = await axios.post(searchUrl, {
      jql: 'ORDER BY created DESC',
      maxResults: 5,
      fields: ['summary', 'status', 'priority', 'assignee', 'created']
    }, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Recherche d\'issues (POST) - Status:', response.status);
    console.log('Issues trouvés:', response.data.total);
    
    if (response.data.issues && response.data.issues.length > 0) {
      console.log('Premier issue:', {
        key: response.data.issues[0].key,
        summary: response.data.issues[0].fields.summary,
        status: response.data.issues[0].fields.status.name
      });
    }
    
    results.push({ name: 'Recherche d\'issues (POST)', success: true });
    
  } catch (error) {
    console.log('❌ Recherche d\'issues (POST) -', error.response?.status || error.message);
    results.push({ name: 'Recherche d\'issues (POST)', success: false });
  }
  
  // Résumé des résultats
  console.log('\n📊 Résumé des tests:');
  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.name}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n🎯 ${successCount}/${results.length} tests réussis`);
  
  if (successCount > 0) {
    console.log('🎉 Au moins un endpoint fonctionne !');
  } else {
    console.log('⚠️ Aucun endpoint ne fonctionne. Vérifiez votre configuration.');
  }
}

testAllEndpoints().catch(console.error);
