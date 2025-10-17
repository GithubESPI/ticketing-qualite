// Test de l'endpoint complet /rest/api/3/issue
const axios = require('axios');

const JIRA_CONFIG = {
  baseUrl: 'https://groupe-espi.atlassian.net',
  email: 'informatique@groupe-espi.fr',
  token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
};

const FULL_ENDPOINT = 'https://groupe-espi.atlassian.net/rest/api/3/issue';

console.log('🧪 Test de l\'endpoint complet...');
console.log('🔗 URL complète:', FULL_ENDPOINT);
console.log('📧 Email:', JIRA_CONFIG.email);
console.log('🔑 Token:', JIRA_CONFIG.token.substring(0, 20) + '...');

async function testFullEndpoint() {
  try {
    console.log('\n🔗 Test 1: Endpoint complet sans ID');
    
    const response = await axios.get(FULL_ENDPOINT, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Endpoint accessible !');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Erreur endpoint complet:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    if (error.response?.data) {
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

async function testWithDifferentMethods() {
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  
  console.log('\n🔗 Test 2: Différentes méthodes HTTP');
  
  for (const method of methods) {
    try {
      console.log(`\n  Test ${method}:`);
      
      const response = await axios({
        method: method.toLowerCase(),
        url: FULL_ENDPOINT,
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      console.log(`  ✅ ${method} - Status: ${response.status}`);
      console.log('  Data:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
      
    } catch (error) {
      console.log(`  ❌ ${method} - ${error.response?.status || error.message}`);
    }
  }
}

async function testWithQueryParameters() {
  console.log('\n🔗 Test 3: Avec paramètres de requête');
  
  const queryParams = [
    '?fields=*',
    '?expand=changelog',
    '?fields=summary,status,priority',
    '?expand=names,renderedFields'
  ];
  
  for (const params of queryParams) {
    try {
      console.log(`\n  Test avec paramètres: ${params}`);
      
      const response = await axios.get(`${FULL_ENDPOINT}${params}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      console.log(`  ✅ Paramètres ${params} - Status: ${response.status}`);
      console.log('  Data:', JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
      
    } catch (error) {
      console.log(`  ❌ Paramètres ${params} - ${error.response?.status || error.message}`);
    }
  }
}

async function testWithIssueId() {
  console.log('\n🔗 Test 4: Avec ID d\'issue spécifique');
  
  // D'abord, essayons de trouver des issues existants
  try {
    console.log('  Recherche d\'issues existants...');
    
    const searchResponse = await axios.post(`${JIRA_CONFIG.baseUrl}/rest/api/3/search`, {
      jql: 'ORDER BY created DESC',
      maxResults: 3,
      fields: ['key', 'summary']
    }, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    if (searchResponse.data.issues && searchResponse.data.issues.length > 0) {
      console.log('  Issues trouvés:', searchResponse.data.issues.length);
      
      for (const issue of searchResponse.data.issues) {
        try {
          console.log(`\n  Test avec issue: ${issue.key}`);
          
          const response = await axios.get(`${FULL_ENDPOINT}/${issue.key}`, {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
          
          console.log(`  ✅ Issue ${issue.key} récupéré !`);
          console.log('  Summary:', response.data.fields?.summary);
          console.log('  Status:', response.data.fields?.status?.name);
          console.log('  Priority:', response.data.fields?.priority?.name);
          
        } catch (error) {
          console.log(`  ❌ Issue ${issue.key} - ${error.response?.status || error.message}`);
        }
      }
    } else {
      console.log('  ⚠️ Aucun issue trouvé pour les tests');
    }
    
  } catch (searchError) {
    console.log('  ❌ Erreur recherche d\'issues:', searchError.response?.status, searchError.response?.statusText);
  }
}

async function runAllTests() {
  console.log('🚀 Début des tests de l\'endpoint complet...\n');
  
  const baseTest = await testFullEndpoint();
  await testWithDifferentMethods();
  await testWithQueryParameters();
  await testWithIssueId();
  
  console.log('\n📊 Résumé des tests:');
  console.log('Endpoint de base:', baseTest ? '✅' : '❌');
  
  if (baseTest) {
    console.log('🎉 L\'endpoint /rest/api/3/issue fonctionne !');
  } else {
    console.log('⚠️ L\'endpoint /rest/api/3/issue ne fonctionne pas avec cette configuration.');
  }
}

runAllTests().catch(console.error);
