// Test de l'API de recherche mise à jour /rest/api/3/search/jql
const axios = require('axios');

const JIRA_CONFIG = {
  baseUrl: 'https://groupe-espi.atlassian.net',
  email: 'informatique@groupe-espi.fr',
  token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
};

console.log('🧪 Test de l\'API de recherche mise à jour...');
console.log('📧 Email:', JIRA_CONFIG.email);
console.log('🔗 Base URL:', JIRA_CONFIG.baseUrl);

async function testSearchJQL() {
  try {
    console.log('\n🔗 Test 1: API de recherche mise à jour /rest/api/3/search/jql');
    
    const response = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/search/jql`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API de recherche accessible !');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('❌ Erreur API de recherche:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    if (error.response?.data) {
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return false;
  }
}

async function testProjects() {
  try {
    console.log('\n🔗 Test 2: Liste des projets pour vérifier l\'accès');
    
    const response = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/project`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Projets accessibles !');
    console.log('Nombre de projets:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('\n📋 Projets disponibles:');
      response.data.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.key}: ${project.name} (${project.projectTypeKey})`);
      });
      
      // Tester la recherche d'issues dans le premier projet
      const firstProject = response.data[0];
      console.log(`\n🔍 Test de recherche d'issues dans le projet: ${firstProject.key}`);
      
      try {
        const issuesResponse = await axios.post(`${JIRA_CONFIG.baseUrl}/rest/api/3/search`, {
          jql: `project = "${firstProject.key}" ORDER BY created DESC`,
          maxResults: 5,
          fields: ['key', 'summary', 'status', 'priority', 'assignee', 'created']
        }, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        console.log('✅ Issues trouvés dans le projet !');
        console.log('Total issues:', issuesResponse.data.total);
        console.log('Issues récupérés:', issuesResponse.data.issues.length);
        
        if (issuesResponse.data.issues.length > 0) {
          console.log('\n📋 Issues du projet:');
          issuesResponse.data.issues.forEach((issue, index) => {
            console.log(`  ${index + 1}. ${issue.key}: ${issue.fields.summary} (${issue.fields.status.name})`);
          });
          
          // Tester l'endpoint /rest/api/3/issue avec un vrai ID
          const firstIssue = issuesResponse.data.issues[0];
          console.log(`\n🔗 Test de l'endpoint /rest/api/3/issue avec ${firstIssue.key}`);
          
          const issueResponse = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/issue/${firstIssue.key}`, {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 10000
          });
          
          console.log('✅ Issue récupéré avec succès !');
          console.log('Key:', issueResponse.data.key);
          console.log('Summary:', issueResponse.data.fields.summary);
          console.log('Status:', issueResponse.data.fields.status.name);
          console.log('Priority:', issueResponse.data.fields.priority.name);
          console.log('Assignee:', issueResponse.data.fields.assignee?.displayName || 'Non assigné');
          console.log('Created:', issueResponse.data.fields.created);
          
          return true;
        } else {
          console.log('⚠️ Aucun issue trouvé dans ce projet');
          return false;
        }
        
      } catch (searchError) {
        console.error('❌ Erreur recherche d\'issues:', searchError.response?.status, searchError.response?.statusText);
        return false;
      }
    } else {
      console.log('⚠️ Aucun projet trouvé');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erreur projets:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    return false;
  }
}

async function testUser() {
  try {
    console.log('\n🔗 Test 3: Informations utilisateur');
    
    const response = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Utilisateur récupéré !');
    console.log('Display Name:', response.data.displayName);
    console.log('Email:', response.data.emailAddress);
    console.log('Account ID:', response.data.accountId);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur utilisateur:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    return false;
  }
}

async function runTests() {
  console.log('🚀 Début des tests complets...\n');
  
  const searchTest = await testSearchJQL();
  const projectsTest = await testProjects();
  const userTest = await testUser();
  
  console.log('\n📊 Résultats des tests:');
  console.log('API de recherche:', searchTest ? '✅' : '❌');
  console.log('Projets:', projectsTest ? '✅' : '❌');
  console.log('Utilisateur:', userTest ? '✅' : '❌');
  
  const successCount = [searchTest, projectsTest, userTest].filter(Boolean).length;
  console.log(`\n🎯 ${successCount}/3 tests réussis`);
  
  if (successCount > 0) {
    console.log('🎉 Au moins une partie de l\'API Jira fonctionne !');
  } else {
    console.log('⚠️ L\'API Jira ne fonctionne pas avec cette configuration.');
    console.log('💡 Suggestion: Générez un token API Jira valide sur https://id.atlassian.com/manage/api-tokens');
  }
}

runTests().catch(console.error);
