const axios = require('axios');

// Configuration avec votre token
const config = {
  jira: {
    baseUrl: 'https://groupe-espi.atlassian.net',
    email: 'informatique@groupe-espi.fr',
    apiToken: 'VOTRE_API_KEY_ICI', // Pas encore configuré
    projectKey: 'DYS',
    
    // Configuration PowerBI avec votre token
    powerbiUrl: 'https://powerbi-cloud-prod.alphaservesp.com/api/export/power-bi/29839696b013042357dcd158e97aeb2b',
    token: '022cdfe1fae84c0e84594705f94d6dd4|V5azNJiNXChC3XQsWfb7bHstpCzrVcg6kzejtKK-momoOYkp7xVFbW989bmq63B5T1WE3CKd4mzpMaEjB6t4Pgb2S3gY7AmNpAqouC69UAa1lie8Eou_VoQiazapljQssc0QtWnd_qvVoo8Io6z8v19JxgWEakuIz7b8LxapD40='
  }
};

console.log('🔍 Mapping des champs PowerBI vers Jira...\n');

async function mapPowerBIToJiraFields() {
  try {
    const powerbiAuth = Buffer.from(`${config.jira.email}:${config.jira.token}`).toString('base64');
    
    // 1. Récupérer les données Issues
    console.log('📋 1. Récupération des données Issues:');
    const issuesResponse = await axios.get(`${config.jira.powerbiUrl}/Issues`, {
      headers: {
        'Authorization': `Basic ${powerbiAuth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ ${issuesResponse.data.value.length} issues récupérés\n`);
    
    // 2. Récupérer les données Entité_Origine
    console.log('📋 2. Récupération des données Entité_Origine:');
    const entiteResponse = await axios.get(`${config.jira.powerbiUrl}/Entité_Origine_de_la_réclamation_10117`, {
      headers: {
        'Authorization': `Basic ${powerbiAuth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ ${entiteResponse.data.value.length} entités récupérées\n`);
    
    // 3. Analyser les champs disponibles
    console.log('🔍 3. Analyse des champs disponibles:');
    
    if (issuesResponse.data.value.length > 0) {
      const issueFields = Object.keys(issuesResponse.data.value[0]);
      console.log(`\n📊 Champs Issues (${issueFields.length}):`);
      issueFields.forEach((field, index) => {
        const value = issuesResponse.data.value[0][field];
        console.log(`${index + 1}. ${field}: ${typeof value} = ${JSON.stringify(value)}`);
      });
    }
    
    if (entiteResponse.data.value.length > 0) {
      const entiteFields = Object.keys(entiteResponse.data.value[0]);
      console.log(`\n📊 Champs Entité_Origine (${entiteFields.length}):`);
      entiteFields.forEach((field, index) => {
        const value = entiteResponse.data.value[0][field];
        console.log(`${index + 1}. ${field}: ${typeof value} = ${JSON.stringify(value)}`);
      });
    }
    
    // 4. Mapping des champs qualité
    console.log('\n🎯 4. Mapping des champs qualité:');
    
    const qualityFieldsMapping = {
      // Champs Issues
      'Action_clôturée__oui_non__10128': {
        jiraField: 'customfield_10001',
        name: 'Action clôturée',
        type: 'string',
        description: 'Indique si l\'action est clôturée (Oui/Non)'
      },
      'Action_corrective__10123': {
        jiraField: 'customfield_10002',
        name: 'Action corrective',
        type: 'string',
        description: 'Description de l\'action corrective'
      },
      'Action_curative__10122': {
        jiraField: 'customfield_10003',
        name: 'Action curative',
        type: 'string',
        description: 'Description de l\'action curative'
      },
      'Date_de_la_constatation_10120': {
        jiraField: 'customfield_10004',
        name: 'Date de constatation',
        type: 'date',
        description: 'Date de la constatation du problème'
      },
      'Date_effective_de_réalisation_10130': {
        jiraField: 'customfield_10005',
        name: 'Date effective de réalisation',
        type: 'date',
        description: 'Date effective de réalisation de l\'action'
      },
      'Efficacité_de_l_action_10127': {
        jiraField: 'customfield_10006',
        name: 'Efficacité de l\'action',
        type: 'string',
        description: 'Évaluation de l\'efficacité de l\'action'
      },
      
      // Champs Entité_Origine
      'Entité_Origine_de_la_réclamation': {
        jiraField: 'customfield_10007',
        name: 'Entité Origine',
        type: 'string',
        description: 'Entité d\'origine de la réclamation'
      }
    };
    
    console.log('✅ Mapping des champs qualité identifié:');
    Object.entries(qualityFieldsMapping).forEach(([powerbiField, mapping]) => {
      console.log(`\n${powerbiField}:`);
      console.log(`  Jira Field: ${mapping.jiraField}`);
      console.log(`  Nom: ${mapping.name}`);
      console.log(`  Type: ${mapping.type}`);
      console.log(`  Description: ${mapping.description}`);
    });
    
    // 5. Génération du code TypeScript
    console.log('\n🔧 5. Code TypeScript généré:');
    console.log('\n// Interface JiraIssue mise à jour:');
    console.log('interface JiraIssue {');
    console.log('  id: string;');
    console.log('  key: string;');
    console.log('  fields: {');
    console.log('    // ... champs standard ...');
    console.log('    ');
    console.log('    // Champs personnalisés identifiés depuis PowerBI');
    Object.entries(qualityFieldsMapping).forEach(([powerbiField, mapping]) => {
      console.log(`    ${mapping.jiraField}?: ${mapping.type === 'date' ? 'string' : mapping.type}; // ${mapping.name}`);
    });
    console.log('  };');
    console.log('}');
    
    // 6. Génération des headers de tableau
    console.log('\n📊 6. Headers de tableau générés:');
    Object.entries(qualityFieldsMapping).forEach(([powerbiField, mapping]) => {
      console.log(`<TableHead onClick={() => handleSort('${mapping.jiraField}')}>`);
      console.log(`  <span>${mapping.name}</span>`);
      console.log(`</TableHead>`);
    });
    
    // 7. Génération des cellules de tableau
    console.log('\n📋 7. Cellules de tableau générées:');
    Object.entries(qualityFieldsMapping).forEach(([powerbiField, mapping]) => {
      console.log(`<TableCell>`);
      if (mapping.type === 'date') {
        console.log(`  <DateDisplay date={issue.fields.${mapping.jiraField}} format="date" />`);
      } else {
        console.log(`  <span>{issue.fields.${mapping.jiraField} || 'Non défini'}</span>`);
      }
      console.log(`</TableCell>`);
    });
    
    // 8. Résumé
    console.log('\n📊 Résumé:');
    console.log(`- Issues PowerBI: ${issuesResponse.data.value.length}`);
    console.log(`- Entités Origine: ${entiteResponse.data.value.length}`);
    console.log(`- Champs qualité identifiés: ${Object.keys(qualityFieldsMapping).length}`);
    console.log(`- Champs Jira mappés: ${Object.values(qualityFieldsMapping).length}`);

  } catch (error) {
    console.error('❌ Erreur lors du mapping:', error.response ? error.response.data : error.message);
  }
}

mapPowerBIToJiraFields();
