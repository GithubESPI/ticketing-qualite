// Test de l'endpoint /rest/api/3/issue
const axios = require('axios');

const JIRA_CONFIG = {
  baseUrl: 'https://groupe-espi.atlassian.net',
  email: 'informatique@groupe-espi.fr',
  token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
};

console.log('🧪 Test de l\'endpoint /rest/api/3/issue...');
console.log('📧 Email:', JIRA_CONFIG.email);
console.log('🔗 Base URL:', JIRA_CONFIG.baseUrl);
console.log('🔑 Token:', JIRA_CONFIG.token.substring(0, 20) + '...');

async function testIssueEndpoint() {
  try {
    console.log('\n🔗 Test 1: Endpoint de base /rest/api/3/issue');
    
    const response = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/issue`, {
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
    console.error('❌ Erreur endpoint de base:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    if (error.response?.data) {
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

async function testIssueWithId() {
  try {
    console.log('\n🔗 Test 2: Endpoint avec ID d\'issue (test avec ID générique)');
    
    // Essayer avec un ID générique
    const testIds = ['1', '10001', 'DEMO-1', 'TEST-1'];
    
    for (const id of testIds) {
      try {
        console.log(`\n  Test avec ID: ${id}`);
        const response = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/issue/${id}`, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        console.log(`  ✅ Issue ${id} trouvé !`);
        console.log('  Key:', response.data.key);
        console.log('  Summary:', response.data.fields?.summary);
        console.log('  Status:', response.data.fields?.status?.name);
        
        return true;
      } catch (error) {
        console.log(`  ❌ Issue ${id} - ${error.response?.status || error.message}`);
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erreur test avec ID:', error.message);
    return false;
  }
}

async function testIssueSearch() {
  try {
    console.log('\n🔗 Test 3: Recherche d\'issues pour trouver des IDs valides');
    
    const response = await axios.post(`${JIRA_CONFIG.baseUrl}/rest/api/3/search`, {
      jql: 'ORDER BY created DESC',
      maxResults: 5,
      fields: ['key', 'summary', 'status']
    }, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Recherche réussie !');
    console.log('Total issues:', response.data.total);
    console.log('Issues trouvés:', response.data.issues.length);
    
    if (response.data.issues.length > 0) {
      console.log('\n📋 Issues disponibles:');
      response.data.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.key}: ${issue.fields.summary} (${issue.fields.status.name})`);
      });
      
      // Tester le premier issue trouvé
      const firstIssue = response.data.issues[0];
      console.log(`\n🔗 Test avec le premier issue: ${firstIssue.key}`);
      
      const issueResponse = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/issue/${firstIssue.key}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Issue récupéré avec succès !');
      console.log('Structure complète:', JSON.stringify(issueResponse.data, null, 2).substring(0, 500) + '...');
      
      return true;
    } else {
      console.log('⚠️ Aucun issue trouvé dans la recherche');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur recherche d\'issues:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    if (error.response?.data) {
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

async function runTests() {
  console.log('🚀 Début des tests de l\'endpoint /rest/api/3/issue...\n');
  
  const baseTest = await testIssueEndpoint();
  const idTest = await testIssueWithId();
  const searchTest = await testIssueSearch();
  
  console.log('\n📊 Résultats des tests:');
  console.log('Endpoint de base:', baseTest ? '✅' : '❌');
  console.log('Test avec ID:', idTest ? '✅' : '❌');
  console.log('Recherche d\'issues:', searchTest ? '✅' : '❌');
  
  const successCount = [baseTest, idTest, searchTest].filter(Boolean).length;
  console.log(`\n🎯 ${successCount}/3 tests réussis`);
  
  if (successCount > 0) {
    console.log('🎉 L\'endpoint /rest/api/3/issue fonctionne !');
  } else {
    console.log('⚠️ L\'endpoint /rest/api/3/issue ne fonctionne pas avec cette configuration.');
  }
}

runTests().catch(console.error);
