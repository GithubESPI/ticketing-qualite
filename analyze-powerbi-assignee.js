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

console.log('🔍 Analyse des données d\'assignation dans PowerBI...\n');

async function analyzePowerBIAssignee() {
  try {
    const powerbiAuth = Buffer.from(`${config.jira.email}:${config.jira.token}`).toString('base64');
    
    // 1. Analyser les issues PowerBI
    console.log('📋 1. Analyse des issues PowerBI:');
    const issuesResponse = await axios.get(`${config.jira.powerbiUrl}/Issues`, {
      headers: {
        'Authorization': `Basic ${powerbiAuth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const issuesData = issuesResponse.data.value || [];
    console.log(`✅ ${issuesData.length} issues récupérés`);

    if (issuesData.length > 0) {
      console.log('\n📊 Structure des données Issues:');
      const firstIssue = issuesData[0];
      Object.keys(firstIssue).forEach((key, index) => {
        const value = firstIssue[key];
        console.log(`${index + 1}. ${key}: ${typeof value} = ${JSON.stringify(value)}`);
      });

      // Rechercher des champs liés à l'assignation
      console.log('\n🔍 Recherche de champs d\'assignation:');
      const assigneeFields = [];
      Object.keys(firstIssue).forEach(key => {
        const fieldName = key.toLowerCase();
        if (fieldName.includes('assign') || 
            fieldName.includes('responsable') || 
            fieldName.includes('pilote') || 
            fieldName.includes('user') || 
            fieldName.includes('person') ||
            fieldName.includes('nom') ||
            fieldName.includes('action')) {
          assigneeFields.push({
            field: key,
            value: firstIssue[key],
            type: typeof firstIssue[key]
          });
        }
      });

      if (assigneeFields.length > 0) {
        console.log(`✅ Champs d'assignation trouvés (${assigneeFields.length}):`);
        assigneeFields.forEach((field, index) => {
          console.log(`${index + 1}. ${field.field}: ${JSON.stringify(field.value)} (${field.type})`);
        });
      } else {
        console.log('Aucun champ d\'assignation trouvé dans les issues');
      }
    }

    // 2. Analyser les entités d'origine
    console.log('\n📋 2. Analyse des entités d\'origine:');
    const entiteResponse = await axios.get(`${config.jira.powerbiUrl}/Entit\u00e9_Origine_de_la_r\u00e9clamation_10117`, {
      headers: {
        'Authorization': `Basic ${powerbiAuth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    const entiteData = entiteResponse.data.value || [];
    console.log(`✅ ${entiteData.length} entités récupérées`);

    if (entiteData.length > 0) {
      console.log('\n📊 Structure des données Entité:');
      const firstEntite = entiteData[0];
      Object.keys(firstEntite).forEach((key, index) => {
        const value = firstEntite[key];
        console.log(`${index + 1}. ${key}: ${typeof value} = ${JSON.stringify(value)}`);
      });

      // Rechercher des champs liés à l'assignation dans les entités
      console.log('\n🔍 Recherche de champs d\'assignation dans les entités:');
      const assigneeFieldsEntite = [];
      Object.keys(firstEntite).forEach(key => {
        const fieldName = key.toLowerCase();
        if (fieldName.includes('assign') || 
            fieldName.includes('responsable') || 
            fieldName.includes('pilote') || 
            fieldName.includes('user') || 
            fieldName.includes('person') ||
            fieldName.includes('nom') ||
            fieldName.includes('action')) {
          assigneeFieldsEntite.push({
            field: key,
            value: firstEntite[key],
            type: typeof firstEntite[key]
          });
        }
      });

      if (assigneeFieldsEntite.length > 0) {
        console.log(`✅ Champs d'assignation trouvés dans les entités (${assigneeFieldsEntite.length}):`);
        assigneeFieldsEntite.forEach((field, index) => {
          console.log(`${index + 1}. ${field.field}: ${JSON.stringify(field.value)} (${field.type})`);
        });
      } else {
        console.log('Aucun champ d\'assignation trouvé dans les entités');
      }
    }

    // 3. Analyser la troisième entité (responsable)
    console.log('\n📋 3. Analyse de l\'entité responsable:');
    try {
      const responsableResponse = await axios.get(`${config.jira.powerbiUrl}/Nom_du_responsable_de_l'action_et_de_son_suivi_10131`, {
        headers: {
          'Authorization': `Basic ${powerbiAuth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      const responsableData = responsableResponse.data.value || [];
      console.log(`✅ ${responsableData.length} responsables récupérés`);

      if (responsableData.length > 0) {
        console.log('\n📊 Structure des données Responsable:');
        const firstResponsable = responsableData[0];
        Object.keys(firstResponsable).forEach((key, index) => {
          const value = firstResponsable[key];
          console.log(`${index + 1}. ${key}: ${typeof value} = ${JSON.stringify(value)}`);
        });
      } else {
        console.log('Aucune donnée de responsable trouvée');
      }
    } catch (error) {
      console.log(`❌ Erreur lors de la récupération des responsables: ${error.response?.data?.errorMessages?.[0] || error.message}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse PowerBI:', error.response ? error.response.data : error.message);
  }
}

analyzePowerBIAssignee();
