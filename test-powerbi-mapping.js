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

console.log('🔍 Test du mapping PowerBI vers format Jira...\n');

async function testPowerBIMapping() {
  try {
    const powerbiAuth = Buffer.from(`${config.jira.email}:${config.jira.token}`).toString('base64');

    // 1. Récupérer les issues depuis PowerBI
    console.log('📋 1. Récupération des issues PowerBI:');
    const issuesResponse = await axios.get(`${config.jira.powerbiUrl}/Issues`, {
      headers: {
        'Authorization': `Basic ${powerbiAuth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const issuesData = issuesResponse.data.value || [];
    console.log(`✅ ${issuesData.length} issues récupérés`);

    // 2. Récupérer les entités d'origine
    console.log('\n📋 2. Récupération des entités d\'origine:');
    const entiteResponse = await axios.get(`${config.jira.powerbiUrl}/Entité_Origine_de_la_réclamation_10117`, {
      headers: {
        'Authorization': `Basic ${powerbiAuth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const entiteData = entiteResponse.data.value || [];
    console.log(`✅ ${entiteData.length} entités récupérées`);

    // 3. Tester le mapping sur les 3 premiers issues
    console.log('\n📊 3. Test du mapping (3 premiers issues):');
    const testIssues = issuesData.slice(0, 3);
    
    testIssues.forEach((issue, index) => {
      console.log(`\n--- Issue ${index + 1} ---`);
      
      // Trouver l'entité correspondante
      const correspondingEntite = entiteData.find(entite => 
        entite.ISSUE_KEY === issue.ISSUE_KEY || entite.ISSUE_ID === issue.ISSUE_ID
      );

      console.log(`Données PowerBI:`);
      console.log(`- Action clôturée: ${issue.Action_clôturée__oui_non__10128}`);
      console.log(`- Action corrective: ${issue.Action_corrective__10123?.substring(0, 50)}...`);
      console.log(`- Efficacité: ${issue.Efficacité_de_l_action_10127}`);
      console.log(`- Date constatation: ${issue.Date_de_la_constatation_10120}`);

      if (correspondingEntite) {
        console.log(`Entité correspondante: ${correspondingEntite.Entité_Origine_de_la_réclamation}`);
      } else {
        console.log('Aucune entité correspondante trouvée');
      }

      // Mapping simulé
      const mappedIssue = {
        key: issue.ISSUE_KEY || `DYS-${index + 1}`,
        summary: issue.Action_corrective__10123 || issue.Action_curative__10122 || 'Issue PowerBI',
        status: issue.Action_clôturée__oui_non__10128 === 'Oui' ? 'Terminé' : 'En cours',
        priority: issue.Efficacité_de_l_action_10127 === 'EFFICACE' ? 'Haute' : 'Normale',
        assignee: correspondingEntite?.Entité_Origine_de_la_réclamation || 'Système Qualité',
        reporter: correspondingEntite?.Entité_Origine_de_la_réclamation || 'Système Qualité',
        issuetype: issue.Action_clôturée__oui_non__10128 === 'Oui' ? 'Task' : 'Bug',
        customfield_10001: issue.Action_clôturée__oui_non__10128 || 'Non défini',
        customfield_10002: issue.Action_corrective__10123 || 'Non défini',
        customfield_10003: issue.Action_curative__10122 || 'Non défini',
        customfield_10004: issue.Date_de_la_constatation_10120 || 'Non défini',
        customfield_10005: issue.Date_effective_de_réalisation_10130 || 'Non défini',
        customfield_10006: issue.Efficacité_de_l_action_10127 || 'Non défini',
        customfield_10007: correspondingEntite?.Entité_Origine_de_la_réclamation || 'Non défini'
      };

      console.log(`\nMapping résultant:`);
      console.log(`- Clé: ${mappedIssue.key}`);
      console.log(`- Résumé: ${mappedIssue.summary.substring(0, 50)}...`);
      console.log(`- Statut: ${mappedIssue.status}`);
      console.log(`- Priorité: ${mappedIssue.priority}`);
      console.log(`- Assigné à: ${mappedIssue.assignee}`);
      console.log(`- Reporter: ${mappedIssue.reporter}`);
      console.log(`- Type: ${mappedIssue.issuetype}`);
      console.log(`- Action clôturée: ${mappedIssue.customfield_10001}`);
      console.log(`- Efficacité: ${mappedIssue.customfield_10006}`);
      console.log(`- Entité Origine: ${mappedIssue.customfield_10007}`);
    });

    // 4. Statistiques
    console.log('\n📊 4. Statistiques du mapping:');
    const statusCounts = {};
    const priorityCounts = {};
    const assigneeCounts = {};
    const customFieldCounts = {};

    testIssues.forEach(issue => {
      const correspondingEntite = entiteData.find(entite => 
        entite.ISSUE_KEY === issue.ISSUE_KEY || entite.ISSUE_ID === issue.ISSUE_ID
      );

      const status = issue.Action_clôturée__oui_non__10128 === 'Oui' ? 'Terminé' : 'En cours';
      const priority = issue.Efficacité_de_l_action_10127 === 'EFFICACE' ? 'Haute' : 'Normale';
      const assignee = correspondingEntite?.Entité_Origine_de_la_réclamation || 'Système Qualité';

      statusCounts[status] = (statusCounts[status] || 0) + 1;
      priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
      assigneeCounts[assignee] = (assigneeCounts[assignee] || 0) + 1;

      // Compter les champs personnalisés remplis
      if (issue.Action_clôturée__oui_non__10128) customFieldCounts['customfield_10001'] = (customFieldCounts['customfield_10001'] || 0) + 1;
      if (issue.Action_corrective__10123) customFieldCounts['customfield_10002'] = (customFieldCounts['customfield_10002'] || 0) + 1;
      if (issue.Action_curative__10122) customFieldCounts['customfield_10003'] = (customFieldCounts['customfield_10003'] || 0) + 1;
      if (issue.Date_de_la_constatation_10120) customFieldCounts['customfield_10004'] = (customFieldCounts['customfield_10004'] || 0) + 1;
      if (issue.Date_effective_de_réalisation_10130) customFieldCounts['customfield_10005'] = (customFieldCounts['customfield_10005'] || 0) + 1;
      if (issue.Efficacité_de_l_action_10127) customFieldCounts['customfield_10006'] = (customFieldCounts['customfield_10006'] || 0) + 1;
      if (correspondingEntite?.Entité_Origine_de_la_réclamation) customFieldCounts['customfield_10007'] = (customFieldCounts['customfield_10007'] || 0) + 1;
    });

    console.log(`Statuts: ${JSON.stringify(statusCounts)}`);
    console.log(`Priorités: ${JSON.stringify(priorityCounts)}`);
    console.log(`Assignés: ${JSON.stringify(assigneeCounts)}`);
    console.log(`Champs personnalisés remplis: ${JSON.stringify(customFieldCounts)}`);

  } catch (error) {
    console.error('❌ Erreur lors du test du mapping:', error.response ? error.response.data : error.message);
  }
}

testPowerBIMapping();
