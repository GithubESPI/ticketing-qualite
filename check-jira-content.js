// Vérification du contenu de votre instance Jira
const axios = require('axios');

const JIRA_CONFIG = {
  baseUrl: 'https://groupe-espi.atlassian.net',
  email: 'informatique@groupe-espi.fr',
  token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
};

console.log('🔍 Vérification du contenu de votre instance Jira...');
console.log('📧 Email:', JIRA_CONFIG.email);
console.log('🔗 Base URL:', JIRA_CONFIG.baseUrl);

async function checkUser() {
  try {
    console.log('\n👤 Vérification de l\'utilisateur...');
    
    const response = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Utilisateur connecté !');
    console.log('Nom:', response.data.displayName);
    console.log('Email:', response.data.emailAddress);
    console.log('Account ID:', response.data.accountId);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur utilisateur:', error.response?.status, error.response?.statusText);
    return false;
  }
}

async function checkProjects() {
  try {
    console.log('\n📋 Vérification des projets...');
    
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
      return response.data;
    } else {
      console.log('⚠️ Aucun projet trouvé');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Erreur projets:', error.response?.status, error.response?.statusText);
    return [];
  }
}

async function checkIssuesInProject(projectKey) {
  try {
    console.log(`\n🔍 Recherche d'issues dans le projet: ${projectKey}`);
    
    // Essayer différentes méthodes de recherche
    const searchMethods = [
      {
        name: 'Recherche simple',
        url: `${JIRA_CONFIG.baseUrl}/rest/api/3/search`,
        data: {
          jql: `project = "${projectKey}" ORDER BY created DESC`,
          maxResults: 10,
          fields: ['key', 'summary', 'status', 'priority']
        }
      },
      {
        name: 'Recherche avec JQL',
        url: `${JIRA_CONFIG.baseUrl}/rest/api/3/search/jql`,
        data: {
          jql: `project = "${projectKey}" ORDER BY created DESC`,
          maxResults: 10
        }
      }
    ];
    
    for (const method of searchMethods) {
      try {
        console.log(`\n  Test: ${method.name}`);
        
        const response = await axios.post(method.url, method.data, {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        
        console.log(`  ✅ ${method.name} fonctionne !`);
        console.log('  Total issues:', response.data.total);
        console.log('  Issues récupérés:', response.data.issues?.length || 0);
        
        if (response.data.issues && response.data.issues.length > 0) {
          console.log('\n  📋 Issues trouvés:');
          response.data.issues.forEach((issue, index) => {
            console.log(`    ${index + 1}. ${issue.key}: ${issue.fields.summary} (${issue.fields.status.name})`);
          });
          
          // Tester l'endpoint /rest/api/3/issue avec le premier issue
          const firstIssue = response.data.issues[0];
          console.log(`\n  🔗 Test de l'endpoint /rest/api/3/issue/${firstIssue.key}`);
          
          try {
            const issueResponse = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/issue/${firstIssue.key}`, {
              headers: {
                'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              timeout: 10000
            });
            
            console.log('  ✅ Endpoint /rest/api/3/issue fonctionne !');
            console.log('  Issue récupéré:', issueResponse.data.key);
            console.log('  Summary:', issueResponse.data.fields.summary);
            console.log('  Status:', issueResponse.data.fields.status.name);
            console.log('  Priority:', issueResponse.data.fields.priority.name);
            
            return true;
          } catch (issueError) {
            console.log('  ❌ Erreur endpoint issue:', issueError.response?.status, issueError.response?.statusText);
          }
        }
        
        return true;
      } catch (error) {
        console.log(`  ❌ ${method.name} - ${error.response?.status || error.message}`);
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Erreur recherche d\'issues:', error.message);
    return false;
  }
}

async function runCheck() {
  console.log('🚀 Vérification complète de votre instance Jira...\n');
  
  const user = await checkUser();
  if (!user) {
    console.log('\n❌ Impossible de se connecter. Vérifiez vos credentials.');
    return;
  }
  
  const projects = await checkProjects();
  if (projects.length === 0) {
    console.log('\n⚠️ Aucun projet trouvé. Créez un projet dans Jira pour continuer.');
    return;
  }
  
  // Tester la recherche d'issues dans le premier projet
  const firstProject = projects[0];
  const issuesFound = await checkIssuesInProject(firstProject.key);
  
  console.log('\n📊 Résumé de la vérification:');
  console.log('Utilisateur:', user ? '✅' : '❌');
  console.log('Projets:', projects.length > 0 ? `✅ (${projects.length})` : '❌');
  console.log('Issues:', issuesFound ? '✅' : '❌');
  
  if (issuesFound) {
    console.log('\n🎉 Votre instance Jira contient des données !');
    console.log('L\'endpoint /rest/api/3/issue fonctionne avec des IDs valides.');
  } else {
    console.log('\n⚠️ Aucun issue trouvé dans votre instance Jira.');
    console.log('💡 Suggestion: Créez quelques issues dans vos projets pour tester l\'API.');
  }
}

runCheck().catch(console.error);
