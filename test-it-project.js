// Test de l'endpoint avec le projet IT
const axios = require('axios');

const JIRA_CONFIG = {
  baseUrl: 'https://groupe-espi.atlassian.net',
  email: 'informatique@groupe-espi.fr',
  token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
};

const PROJECT_KEY = 'IT';

console.log('🧪 Test avec le projet IT...');
console.log('📧 Email:', JIRA_CONFIG.email);
console.log('🔗 Base URL:', JIRA_CONFIG.baseUrl);
console.log('🔑 Projet:', PROJECT_KEY);

async function testProjectIT() {
  try {
    console.log('\n🔗 Test 1: Vérification du projet IT');
    
    const response = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/project/${PROJECT_KEY}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Projet IT trouvé !');
    console.log('Key:', response.data.key);
    console.log('Name:', response.data.name);
    console.log('Type:', response.data.projectTypeKey);
    console.log('Description:', response.data.description);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur projet IT:', error.response?.status, error.response?.statusText);
    return false;
  }
}

async function searchIssuesInIT() {
  try {
    console.log('\n🔍 Test 2: Recherche d\'issues dans le projet IT');
    
    const response = await axios.post(`${JIRA_CONFIG.baseUrl}/rest/api/3/search`, {
      jql: `project = "${PROJECT_KEY}" ORDER BY created DESC`,
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
    
    console.log('✅ Recherche réussie !');
    console.log('Total issues dans IT:', response.data.total);
    console.log('Issues récupérés:', response.data.issues.length);
    
    if (response.data.issues.length > 0) {
      console.log('\n📋 Issues trouvés dans le projet IT:');
      response.data.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue.key}: ${issue.fields.summary}`);
        console.log(`     Status: ${issue.fields.status.name}`);
        console.log(`     Priority: ${issue.fields.priority.name}`);
        console.log(`     Assignee: ${issue.fields.assignee?.displayName || 'Non assigné'}`);
        console.log(`     Created: ${issue.fields.created}`);
        console.log('');
      });
      
      return response.data.issues;
    } else {
      console.log('⚠️ Aucun issue trouvé dans le projet IT');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Erreur recherche issues:', error.response?.status, error.response?.statusText);
    if (error.response?.data) {
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    return [];
  }
}

async function testIssueEndpoint(issues) {
  if (issues.length === 0) {
    console.log('\n⚠️ Aucun issue à tester');
    return false;
  }
  
  console.log('\n🔗 Test 3: Endpoint /rest/api/3/issue avec les issues du projet IT');
  
  for (const issue of issues.slice(0, 3)) { // Tester les 3 premiers issues
    try {
      console.log(`\n  Test avec issue: ${issue.key}`);
      
      const response = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/issue/${issue.key}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log(`  ✅ Issue ${issue.key} récupéré avec succès !`);
      console.log('  Key:', response.data.key);
      console.log('  Summary:', response.data.fields.summary);
      console.log('  Status:', response.data.fields.status.name);
      console.log('  Priority:', response.data.fields.priority.name);
      console.log('  Assignee:', response.data.fields.assignee?.displayName || 'Non assigné');
      console.log('  Created:', response.data.fields.created);
      console.log('  Updated:', response.data.fields.updated);
      
      if (response.data.fields.description) {
        console.log('  Description:', response.data.fields.description.substring(0, 100) + '...');
      }
      
      // Tester avec des paramètres d'expansion
      console.log(`\n  Test avec expansion: ${issue.key}?expand=changelog`);
      
      const expandedResponse = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/issue/${issue.key}?expand=changelog`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log(`  ✅ Issue ${issue.key} avec expansion récupéré !`);
      console.log('  Changelog disponible:', !!expandedResponse.data.changelog);
      
    } catch (error) {
      console.log(`  ❌ Erreur issue ${issue.key}:`, error.response?.status, error.response?.statusText);
    }
  }
  
  return true;
}

async function runTests() {
  console.log('🚀 Début des tests avec le projet IT...\n');
  
  const project = await testProjectIT();
  if (!project) {
    console.log('\n❌ Projet IT non accessible');
    return;
  }
  
  const issues = await searchIssuesInIT();
  const endpointTest = await testIssueEndpoint(issues);
  
  console.log('\n📊 Résumé des tests:');
  console.log('Projet IT:', project ? '✅' : '❌');
  console.log('Issues trouvés:', issues.length);
  console.log('Endpoint /rest/api/3/issue:', endpointTest ? '✅' : '❌');
  
  if (issues.length > 0 && endpointTest) {
    console.log('\n🎉 L\'endpoint /rest/api/3/issue fonctionne parfaitement avec le projet IT !');
    console.log('Vous pouvez maintenant utiliser cet endpoint dans votre application.');
  } else if (issues.length === 0) {
    console.log('\n⚠️ Aucun issue trouvé dans le projet IT.');
    console.log('💡 Suggestion: Créez quelques issues dans le projet IT pour tester l\'API.');
  } else {
    console.log('\n❌ L\'endpoint /rest/api/3/issue ne fonctionne pas');
  }
}

runTests().catch(console.error);
