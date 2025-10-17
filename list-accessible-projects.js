// Lister tous les projets accessibles
const axios = require('axios');

const JIRA_CONFIG = {
  baseUrl: 'https://groupe-espi.atlassian.net',
  email: 'informatique@groupe-espi.fr',
  token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
};

console.log('📋 Liste des projets accessibles...');
console.log('📧 Email:', JIRA_CONFIG.email);
console.log('🔗 Base URL:', JIRA_CONFIG.baseUrl);

async function listProjects() {
  try {
    console.log('\n🔗 Récupération de tous les projets...');
    
    const response = await axios.get(`${JIRA_CONFIG.baseUrl}/rest/api/3/project`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Projets récupérés !');
    console.log('Nombre total:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('\n📋 Projets accessibles:');
      response.data.forEach((project, index) => {
        console.log(`  ${index + 1}. ${project.key}: ${project.name}`);
        console.log(`     Type: ${project.projectTypeKey}`);
        console.log(`     Description: ${project.description || 'Aucune description'}`);
        console.log(`     Lead: ${project.lead?.displayName || 'Non défini'}`);
        console.log('');
      });
      
      // Tester la recherche d'issues dans chaque projet
      console.log('\n🔍 Test de recherche d\'issues dans chaque projet...');
      
      for (const project of response.data.slice(0, 3)) { // Tester les 3 premiers projets
        try {
          console.log(`\n  Test du projet: ${project.key}`);
          
          const issuesResponse = await axios.post(`${JIRA_CONFIG.baseUrl}/rest/api/3/search`, {
            jql: `project = "${project.key}" ORDER BY created DESC`,
            maxResults: 5,
            fields: ['key', 'summary', 'status']
          }, {
            headers: {
              'Authorization': `Basic ${Buffer.from(`${JIRA_CONFIG.email}:${JIRA_CONFIG.token}`).toString('base64')}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            timeout: 5000
          });
          
          console.log(`  ✅ Projet ${project.key}: ${issuesResponse.data.total} issues trouvés`);
          
          if (issuesResponse.data.issues.length > 0) {
            console.log(`  📋 Issues dans ${project.key}:`);
            issuesResponse.data.issues.forEach((issue, idx) => {
              console.log(`    ${idx + 1}. ${issue.key}: ${issue.fields.summary} (${issue.fields.status.name})`);
            });
          }
          
        } catch (error) {
          console.log(`  ❌ Projet ${project.key}: ${error.response?.status || error.message}`);
        }
      }
      
    } else {
      console.log('⚠️ Aucun projet accessible');
    }
    
    return response.data;
    
  } catch (error) {
    console.error('❌ Erreur récupération projets:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Message:', error.message);
    
    if (error.response?.data) {
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
    
    return [];
  }
}

async function runList() {
  console.log('🚀 Début de la liste des projets...\n');
  
  const projects = await listProjects();
  
  console.log('\n📊 Résumé:');
  console.log('Projets accessibles:', projects.length);
  
  if (projects.length > 0) {
    console.log('\n🎉 Vous avez accès à des projets !');
    console.log('Utilisez une des clés de projet ci-dessus pour tester l\'endpoint /rest/api/3/issue');
  } else {
    console.log('\n⚠️ Aucun projet accessible avec vos credentials actuels');
    console.log('💡 Suggestion: Vérifiez vos permissions ou générez un token API Jira valide');
  }
}

runList().catch(console.error);
