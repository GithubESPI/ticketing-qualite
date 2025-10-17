const axios = require('axios');

// Configuration avec votre token
const config = {
  jira: {
    baseUrl: 'https://groupe-espi.atlassian.net',
    email: 'informatique@groupe-espi.fr',
    apiToken: 'VOTRE_API_KEY_ICI',
    projectKey: 'DYS',
    
    // Configuration PowerBI avec votre token
    powerbiUrl: 'https://powerbi-cloud-prod.alphaservesp.com/api/export/power-bi/29839696b013042357dcd158e97aeb2b',
    token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
  }
};

console.log('🔍 Test des descriptions PowerBI...\n');

async function testDescriptions() {
  try {
    const powerbiAuth = Buffer.from(`${config.jira.email}:${config.jira.token}`).toString('base64');

    // Récupérer les issues depuis PowerBI
    console.log('📋 Récupération des issues PowerBI:');
    const issuesResponse = await axios.get(`${config.jira.powerbiUrl}/Issues`, {
      headers: {
        'Authorization': `Basic ${powerbiAuth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const issuesData = issuesResponse.data.value || [];
    console.log(`✅ ${issuesData.length} issues récupérés`);

    // Analyser les descriptions disponibles
    console.log('\n📊 Analyse des descriptions:');
    const descriptionsWithContent = [];
    const descriptionsEmpty = [];

    issuesData.forEach((issue, index) => {
      const actionCorrective = issue.Action_corrective__10123;
      const actionCurative = issue.Action_curative__10122;
      
      // Utiliser l'action corrective comme description principale
      const description = actionCorrective || actionCurative || 'Aucune description';
      
      if (description && description !== 'Aucune description') {
        descriptionsWithContent.push({
          index: index + 1,
          key: issue.ISSUE_KEY || `DYS-${index + 1}`,
          description: description,
          length: description.length,
          type: actionCorrective ? 'Action corrective' : 'Action curative'
        });
      } else {
        descriptionsEmpty.push({
          index: index + 1,
          key: issue.ISSUE_KEY || `DYS-${index + 1}`
        });
      }
    });

    console.log(`✅ ${descriptionsWithContent.length} issues avec description`);
    console.log(`❌ ${descriptionsEmpty.length} issues sans description`);

    // Afficher les 5 premières descriptions
    console.log('\n📝 Exemples de descriptions (5 premiers):');
    descriptionsWithContent.slice(0, 5).forEach(item => {
      console.log(`\n--- Issue ${item.index} (${item.key}) ---`);
      console.log(`Type: ${item.type}`);
      console.log(`Longueur: ${item.length} caractères`);
      console.log(`Description: ${item.description.substring(0, 100)}...`);
    });

    // Statistiques des types de descriptions
    const typeStats = {};
    descriptionsWithContent.forEach(item => {
      typeStats[item.type] = (typeStats[item.type] || 0) + 1;
    });

    console.log('\n📊 Statistiques des types de descriptions:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`- ${type}: ${count} issues`);
    });

    // Test du mapping final
    console.log('\n🔄 Test du mapping final:');
    const testIssue = issuesData[0];
    const mappedDescription = testIssue.Action_corrective__10123 || testIssue.Action_curative__10122 || 'Description depuis PowerBI';
    
    console.log(`Issue test: ${testIssue.ISSUE_KEY || 'DYS-1'}`);
    console.log(`Description mappée: ${mappedDescription.substring(0, 100)}...`);
    console.log(`Longueur: ${mappedDescription.length} caractères`);

  } catch (error) {
    console.error('❌ Erreur lors du test des descriptions:', error.response ? error.response.data : error.message);
  }
}

testDescriptions();
